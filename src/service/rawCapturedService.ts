import { createContentHash } from "../lib/hash"
import { db } from "../prisma/db"

export interface CreateRawCaptureInput {
  sourceId: string
  url?: string
  authorName?: string
  authorVerified?: boolean
  contentText: string
  mediaUrls?: string
  engagementMetrics?: string
  publishedAt?: string
  contentHash: string
}

export async function createRawCapture(data: CreateRawCaptureInput) {
  const existing = await db.orm.public.RawCapture.where({
    contentHash: data.contentHash,
  }).first()

  if (existing) {
    return existing
  }

  return db.orm.public.RawCapture.create({
    sourceId: data.sourceId,
    url: data.url,
    authorName: data.authorName,
    authorVerified: data.authorVerified ?? false,
    contentText: data.contentText,
    mediaUrls: data.mediaUrls,
    engagementMetrics: data.engagementMetrics,
    publishedAt: data.publishedAt,
    capturedAt: new Date().toISOString(),
    contentHash: data.contentHash,
  })
}