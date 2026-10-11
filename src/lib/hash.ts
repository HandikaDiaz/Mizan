import crypto from "crypto"

export function createContentHash(content: string) {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex")
}