import { z } from "zod"

export const DISBURSEMENT_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024
export const DISBURSEMENT_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const disbursementRequestItemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive(),
  unit: z.string().trim().min(1).max(40),
  unitPriceWei: z.string().regex(/^\d+$/, "Harga harus berupa wei positif."),
})

export const disbursementRequestInputSchema = z
  .object({
    requestedAmountWei: z.string().regex(/^\d+$/, "Nominal harus berupa wei positif."),
    description: z.string().trim().min(1).max(2000),
    region: z.string().trim().min(1).max(120).default("Indonesia"),
    items: z.array(disbursementRequestItemSchema).min(1).max(100),
  })
  .superRefine((value, context) => {
    const requested = BigInt(value.requestedAmountWei)
    const itemTotal = value.items.reduce(
      (total, item) => total + BigInt(item.quantity) * BigInt(item.unitPriceWei),
      BigInt(0),
    )

    if (requested <= BigInt(0)) {
      context.addIssue({
        code: "custom",
        path: ["requestedAmountWei"],
        message: "Nominal pencairan harus lebih besar dari nol.",
      })
    }
    if (itemTotal !== requested) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Total rincian item harus sama dengan nominal pencairan.",
      })
    }
  })

export type DisbursementRequestItem = z.infer<typeof disbursementRequestItemSchema>
export type DisbursementRequestInput = z.infer<typeof disbursementRequestInputSchema>
export type { DisbursementRequestStatus } from "./disbursement-workflow"

export const isPublicDisbursementStatus = (status: string): status is "DISBURSED" =>
  status === "DISBURSED"

export const validateDisbursementDocument = (file: File): string | null => {
  if (file.size <= 0) return "Dokumen tidak boleh kosong."
  if (file.size > DISBURSEMENT_DOCUMENT_MAX_SIZE) {
    return `Dokumen terlalu besar (maks ${DISBURSEMENT_DOCUMENT_MAX_SIZE / 1024 / 1024} MB).`
  }
  if (!(DISBURSEMENT_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Dokumen harus berupa PDF, DOC, atau DOCX."
  }
  const extension = file.name.toLowerCase().split(".").pop()
  const expectedExtension = file.type === "application/pdf"
    ? "pdf"
    : file.type === "application/msword"
      ? "doc"
      : "docx"
  if (extension !== expectedExtension) return "MIME type dan ekstensi dokumen tidak cocok."
  return null
}

export const validateDisbursementDocumentFile = async (file: File): Promise<string | null> => {
  const metadataError = validateDisbursementDocument(file)
  if (metadataError) return metadataError
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  const isPdf = header.length >= 4 && String.fromCharCode(...header) === "%PDF"
  const isZip = header.length >= 4 && header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04
  const isLegacyDoc = header.length >= 4 && header[0] === 0xd0 && header[1] === 0xcf && header[2] === 0x11 && header[3] === 0xe0
  const contentMatchesType = file.type === "application/pdf"
    ? isPdf
    : file.type === "application/msword"
      ? isLegacyDoc
      : isZip
  if (!contentMatchesType) {
    return "Isi dokumen tidak sesuai dengan tipe file."
  }
  return null
}
