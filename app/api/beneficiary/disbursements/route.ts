import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/src/lib/auth"
import { analyzeDisbursementWithLangflow } from "@/src/lib/disbursement-langflow"
import { disbursementRequestInputSchema, validateDisbursementDocumentFile } from "@/src/lib/disbursement"
import { createDisbursementIdempotencyKey, getActiveRequestKey, validateRequestAmount, validateRequestItems } from "@/src/lib/disbursement-validation"
import { isActiveDisbursementStatus } from "@/src/lib/disbursement-workflow"
import { db } from "@/src/prisma/db"
import { uploadDisbursementDocument } from "@/src/lib/storage"

const parseItems = (value: FormDataEntryValue | null): unknown => {
  if (typeof value !== "string") return null
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

const ACTIVE_REQUEST_EXISTS = "ACTIVE_REQUEST_EXISTS"

export async function POST(request: NextRequest) {
  try {
    const auth = await getSession(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const milestoneId = Number(formData.get("milestoneId"))
    const document = formData.get("document")
    if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
      return NextResponse.json({ error: "Milestone tidak valid." }, { status: 400 })
    }
    if (!(document instanceof File)) {
      return NextResponse.json({ error: "Dokumen pengajuan wajib diunggah." }, { status: 400 })
    }
    const documentError = await validateDisbursementDocumentFile(document)
    if (documentError) return NextResponse.json({ error: documentError }, { status: 400 })

    const membership = await db.orm.public.CommunityMember.where({
      userId: auth.user.id,
      status: "ACTIVE",
    }).first()
    if (!membership) return NextResponse.json({ error: "Akses beneficiary tidak ditemukan." }, { status: 403 })

    const milestone = await db.orm.public.Milestone.first({ id: milestoneId })
    if (!milestone) return NextResponse.json({ error: "Milestone tidak ditemukan." }, { status: 404 })
    if (milestone.status !== "AI_VERIFIED" && milestone.status !== "MANUAL_REVIEW") {
      return NextResponse.json({ error: "Milestone belum siap diajukan untuk pencairan." }, { status: 400 })
    }
    const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
    if (!campaign || campaign.communityId !== membership.communityId) {
      return NextResponse.json({ error: "Akses ke milestone ditolak." }, { status: 403 })
    }
    const community = await db.orm.public.Community.first({ id: membership.communityId })
    const user = await db.orm.public.User.first({ id: auth.user.id })
    if (!community || !user) return NextResponse.json({ error: "Data organisasi tidak ditemukan." }, { status: 404 })

    const parsed = disbursementRequestInputSchema.safeParse({
      requestedAmountWei: String(formData.get("requestedAmountWei") ?? ""),
      description: String(formData.get("description") ?? ""),
      region: String(formData.get("region") ?? "Indonesia"),
      items: parseItems(formData.get("items")),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: "Data pengajuan tidak valid.", issues: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    if (!validateRequestAmount(milestone.amountWei, parsed.data.requestedAmountWei)) {
      return NextResponse.json({ error: "Nominal pengajuan harus sama persis dengan nominal milestone." }, { status: 422 })
    }
    if (!validateRequestItems(parsed.data.items, milestone.amountWei)) {
      return NextResponse.json({ error: "Total rincian item harus sama persis dengan nominal milestone." }, { status: 422 })
    }

    const activeRequestKey = getActiveRequestKey(milestone.id)
    const existingRequests = await db.orm.public.DisbursementRequest.where({ milestoneId: milestone.id }).all()
    if (existingRequests.some((item) => isActiveDisbursementStatus(item.status))) {
      return NextResponse.json({ error: "Milestone sudah memiliki pengajuan aktif." }, { status: 409 })
    }

    const requestKey = crypto.randomUUID()
    const safeName = document.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "document"
    const documentStoragePath = `${community.id}/${campaign.id}/${milestone.id}/${requestKey}/${safeName}`
    await uploadDisbursementDocument(document, documentStoragePath)

    let created
    try {
      created = await db.transaction(async (transaction) => {
        const activeRequest = await transaction.orm.public.DisbursementRequest.first({ activeRequestKey })
        if (activeRequest && isActiveDisbursementStatus(activeRequest.status)) {
          throw new Error(ACTIVE_REQUEST_EXISTS)
        }
        return transaction.orm.public.DisbursementRequest.create({
          milestoneId: milestone.id,
          communityId: community.id,
          requestedByUserId: user.id,
          requestedAmountWei: parsed.data.requestedAmountWei,
          description: parsed.data.description,
          region: parsed.data.region,
          items: parsed.data.items,
          documentStoragePath,
          documentFileName: document.name,
          documentMimeType: document.type,
          status: "SUBMITTED",
          idempotencyKey: createDisbursementIdempotencyKey(),
          activeRequestKey,
        })
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (
        message.includes(ACTIVE_REQUEST_EXISTS) ||
        (message.includes("activeRequestKey") && /unique|duplicate/i.test(message))
      ) {
        return NextResponse.json({ error: "Milestone sudah memiliki pengajuan aktif." }, { status: 409 })
      }
      throw error
    }

    const analysis = await analyzeDisbursementWithLangflow({
      file: document,
      metadata: {
        organizationName: community.name,
        campaignTitle: campaign.title,
        milestoneDescription: milestone.description,
        requestedAmountWei: parsed.data.requestedAmountWei,
        description: parsed.data.description,
        region: parsed.data.region,
        items: parsed.data.items,
        walletAddress: community.walletAddress,
      },
    })
    const nextStatus = analysis.decision === "APPROVE"
      ? "AI_VERIFIED"
      : analysis.decision === "REJECT" ? "REJECTED" : "MANUAL_REVIEW"

    await db.orm.public.DisbursementRequest.where({ id: created.id }).update({
      langflowDecision: analysis.decision,
      langflowConfidence: analysis.confidence,
      langflowOutput: {
        decision: analysis.decision,
        confidence: analysis.confidence,
        issues: analysis.issues,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
      },
      status: nextStatus,
      ...(nextStatus === "REJECTED" ? { activeRequestKey: null } : {}),
    })
    await db.orm.public.Milestone.where({ id: milestone.id }).update({
      status: nextStatus,
      disbursementRequestedAt: new Date().toISOString(),
      aiVerificationNote: analysis.summary || analysis.issues.join(" ") || null,
      aiConfidence: analysis.confidence,
    })

    return NextResponse.json({ id: created.id, status: nextStatus, analysis }, { status: 201 })
  } catch (error) {
    console.error("Gagal membuat pengajuan pencairan", error)
    return NextResponse.json({ error: "Gagal memproses pengajuan pencairan." }, { status: 500 })
  }
}
