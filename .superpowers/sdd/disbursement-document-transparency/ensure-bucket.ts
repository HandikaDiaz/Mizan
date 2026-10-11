import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local", override: true })
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Supabase env vars missing")

const client = createClient(url, key, { auth: { persistSession: false } })
const { data, error } = await client.storage.listBuckets()
if (error) throw error
if (data.some((bucket) => bucket.name === "disbursement-documents")) {
  console.log("exists")
} else {
  const result = await client.storage.createBucket("disbursement-documents", {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  })
  if (result.error) throw result.error
  console.log("created")
}
