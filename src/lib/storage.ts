import "server-only"

import { createClient } from "@supabase/supabase-js"
import { getStoragePathFromReference } from "./storage-reference"
import {
  validateDisbursementDocument,
  DISBURSEMENT_DOCUMENT_MAX_SIZE,
} from "./disbursement"

const BUCKET = "milestone-proofs"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const DISBURSEMENT_BUCKET = "disbursement-documents"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Upload a proof image or PDF to Supabase Storage.
 *
 * @param file  The image/PDF File from the form
 * @param path  Storage path, e.g. `{communityId}/{campaignId}/{milestoneId}/{timestamp}.jpg`
 * @returns     Stable private Storage path of the uploaded file
 */
export async function uploadMilestoneProof(file: File, path: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar (maks ${MAX_FILE_SIZE / 1024 / 1024} MB).`)
  }
  if (
    !file.type.startsWith("image/") &&
    file.type !== "application/pdf" &&
    file.type !== "application/msword" &&
    file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    throw new Error("File bukti harus berupa gambar, PDF, DOC, atau DOCX.")
  }

  const supabase = getSupabaseAdmin()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error("Supabase Storage upload error:", error)
    throw new Error(`Gagal mengunggah bukti: ${error.message}`)
  }

  return path
}

export async function getMilestoneProofUrl(reference: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  const path = getStoragePathFromReference(reference, BUCKET)
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24)

  if (error || !data?.signedUrl) {
    console.error("Supabase Storage signed URL error:", error)
    throw new Error("URL sementara bukti gagal dibuat.")
  }

  return data.signedUrl
}

export async function uploadDisbursementDocument(file: File, path: string): Promise<string> {
  const validationError = validateDisbursementDocument(file)
  if (validationError) throw new Error(validationError)

  if (file.size > DISBURSEMENT_DOCUMENT_MAX_SIZE) {
    throw new Error("Dokumen pencairan melebihi batas ukuran.")
  }

  const supabase = getSupabaseAdmin()
  const buffer = new Uint8Array(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(DISBURSEMENT_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) {
    console.error("Supabase disbursement document upload error:", error)
    throw new Error(`Gagal mengunggah dokumen pencairan: ${error.message}`)
  }

  return path
}

export async function getDisbursementDocumentUrl(reference: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  const path = getStoragePathFromReference(reference, DISBURSEMENT_BUCKET)
  const { data, error } = await supabase.storage
    .from(DISBURSEMENT_BUCKET)
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl) {
    console.error("Supabase disbursement document signed URL error:", error)
    throw new Error("URL dokumen pencairan gagal dibuat.")
  }

  return data.signedUrl
}
