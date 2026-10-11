"use client"

import { createClient } from "@/src/lib/client"

// Public Storage bucket that holds campaign cover images.
// Create it once in the Supabase dashboard (Storage -> New bucket -> "campaign-images",
// set to Public) so uploaded covers are readable by next/image.
export const CAMPAIGN_IMAGE_BUCKET = "campaign-images"

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

function extensionFor(file: File): string {
  const fromName = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : ""
  if (fromName) return fromName
  const fromType = file.type.split("/")[1]
  return fromType || "bin"
}

/**
 * Uploads a campaign cover image to Supabase Storage and returns its public URL.
 * Runs in the browser with the publishable (anon) key, so the bucket must exist
 * and allow public read + anon insert.
 */
export async function uploadCampaignImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Format harus PNG, JPG, WEBP, atau GIF." }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Ukuran gambar maksimal 5 MB." }
  }

  const supabase = createClient()
  const path = `covers/${crypto.randomUUID()}.${extensionFor(file)}`

  const { error } = await supabase.storage
    .from(CAMPAIGN_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return {
      ok: false,
      error:
        "Gagal mengunggah gambar. Pastikan bucket 'campaign-images' ada dan bersifat publik, atau tempel URL gambar secara manual.",
    }
  }

  const { data } = supabase.storage
    .from(CAMPAIGN_IMAGE_BUCKET)
    .getPublicUrl(path)

  return { ok: true, url: data.publicUrl }
}
