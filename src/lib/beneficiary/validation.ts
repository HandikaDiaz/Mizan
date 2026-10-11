import { z } from "zod"

const weiString = z.string().regex(/^\d+$/, "Nominal harus berupa angka wei yang valid.").refine(
  (value) => BigInt(value) > BigInt(0),
  "Nominal harus lebih besar dari nol.",
)

const milestoneSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi milestone wajib diisi."),
  amountWei: weiString,
})

export const campaignInputSchema = z
  .object({
    title: z.string().trim().min(1, "Judul kampanye wajib diisi."),
    category: z.enum(["ZAKAT", "DONASI_UMUM", "WAKAF", "BENCANA"]),
    description: z.string().trim().min(1, "Deskripsi kampanye wajib diisi."),
    targetAmountWei: weiString,
    recipientWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Alamat dompet tidak valid."),
    currency: z.enum(["BNB", "USDT"]).default("BNB"),
    image: z.string().trim().max(1000, "URL gambar terlalu panjang.").optional(),
    location: z.string().trim().max(200, "Lokasi terlalu panjang.").optional(),
    daysLeft: z.coerce.number().int().min(1, "Deadline minimal satu hari.").max(3650),
    milestones: z.array(milestoneSchema).min(1, "Minimal satu milestone wajib diisi."),
  })
  .superRefine((value, context) => {
    const total = value.milestones.reduce((sum, milestone) => sum + BigInt(milestone.amountWei), BigInt(0))
    if (total !== BigInt(value.targetAmountWei)) {
      context.addIssue({
        code: "custom",
        path: ["milestones"],
        message: "Total milestone harus sama dengan target dana",
      })
    }
  })

export type CampaignInput = z.infer<typeof campaignInputSchema>

export const campaignCategoryLabels = {
  ZAKAT: "Zakat",
  DONASI_UMUM: "Donasi Umum",
  WAKAF: "Wakaf",
  BENCANA: "Tanggap Bencana",
} as const
