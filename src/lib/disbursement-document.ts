import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { DisbursementRequestItem } from "./disbursement"

// Logo kop surat Mizan — file statis, bukan per-organisasi. Taruh PNG-nya di lib/assets/.
const LETTERHEAD_LOGO_PATH = join(process.cwd(), "public", "mizan-letterhead-logo.png")
// Dimensi asli logo dalam EMU (914400 EMU = 1 inci) — jaga rasio, jangan diregangkan.
const LETTERHEAD_LOGO_WIDTH_EMU = 2011680
const LETTERHEAD_LOGO_HEIGHT_EMU = 1050544

export type DisbursementDocumentInput = {
  organizationName: string
  registrationNumber?: string | null
  campaignTitle: string
  milestoneDescription: string
  walletAddress: string
  requestedAmountWei: string
  currency: string
  description: string
  region: string
  requesterName: string
  requestDate: string
  /** Baris rincian yang sudah terisi. Isi `[]` untuk template kosong yang diisi sendiri oleh pengaju. */
  items: DisbursementRequestItem[]
  /** Jumlah minimum baris tabel rincian bila pemanggil memang memintanya. */
  minRows?: number
}

// A4 (11906 dxa) dikurangi margin kiri-kanan (2 × 1440). Semua lebar kolom harus berjumlah PAGE_WIDTH.
const PAGE_WIDTH = 9026
const ITEM_COLUMNS = [500, 3000, 950, 1000, 1700, 1876]
const ITEM_ALIGN = ["center", "left", "right", "center", "right", "right"] as const
const INFO_COLUMNS = [2500, 300, 6226]
const DOTS = ".".repeat(70)
const ROW_HEIGHT = 440

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")

type RunStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  /** Ukuran dalam half-point (22 = 11pt). */
  size?: number
  color?: string
  highlight?: string
}

type ParagraphStyle = RunStyle & {
  align?: "left" | "center" | "right" | "both"
  before?: number
  after?: number
  keepNext?: boolean
  bottomBorder?: boolean
}

// Urutan elemen di <w:rPr> dan <w:pPr> diatur skema OOXML — jangan diacak, Word bisa menolak file.
const run = (value: string, style: RunStyle = {}): string => {
  const props =
    (style.bold ? "<w:b/><w:bCs/>" : "") +
    (style.italic ? "<w:i/><w:iCs/>" : "") +
    (style.color ? `<w:color w:val="${style.color}"/>` : "") +
    (style.size ? `<w:sz w:val="${style.size}"/><w:szCs w:val="${style.size}"/>` : "") +
    (style.highlight ? `<w:highlight w:val="${style.highlight}"/>` : "") +
    (style.underline ? `<w:u w:val="single"/>` : "")
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}<w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r>`
}

const paragraph = (value: string, style: ParagraphStyle = {}): string => {
  const spacing =
    style.before !== undefined || style.after !== undefined
      ? `<w:spacing${style.before !== undefined ? ` w:before="${style.before}"` : ""}${style.after !== undefined ? ` w:after="${style.after}"` : ""}/>`
      : ""
  const props =
    (style.keepNext ? "<w:keepNext/>" : "") +
    (style.bottomBorder ? `<w:pBdr><w:bottom w:val="double" w:sz="6" w:space="8" w:color="000000"/></w:pBdr>` : "") +
    spacing +
    (style.align ? `<w:jc w:val="${style.align}"/>` : "")
  return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ""}${value ? run(value, style) : ""}</w:p>`
}

// Newline di dalam <w:t> tidak dirender Word — pecah jadi paragraf terpisah.
const paragraphs = (text: string, style: ParagraphStyle = {}): string =>
  text
    .split(/\r?\n/)
    .map((line) => paragraph(line, style))
    .join("")

type CellOptions = {
  width: number
  span?: number
  fill?: string
  vAlign?: "top" | "center"
}

const cell = (content: string, { width, span, fill, vAlign = "center" }: CellOptions): string =>
  `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span ? `<w:gridSpan w:val="${span}"/>` : ""}${
    fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ""
  }<w:vAlign w:val="${vAlign}"/></w:tcPr>${content || paragraph("", { after: 0 })}</w:tc>`

const row = (cells: string, options: { header?: boolean; height?: number } = {}): string =>
  `<w:tr><w:trPr><w:cantSplit/>${options.height ? `<w:trHeight w:val="${options.height}" w:hRule="atLeast"/>` : ""}${
    options.header ? "<w:tblHeader/>" : ""
  }</w:trPr>${cells}</w:tr>`

const BORDER = 'w:val="single" w:sz="4" w:space="0" w:color="000000"'

const table = (columns: number[], rows: string, bordered = true): string =>
  `<w:tbl><w:tblPr><w:tblW w:w="${columns.reduce((total, width) => total + width, 0)}" w:type="dxa"/>${
    bordered
      ? `<w:tblBorders><w:top ${BORDER}/><w:left ${BORDER}/><w:bottom ${BORDER}/><w:right ${BORDER}/><w:insideH ${BORDER}/><w:insideV ${BORDER}/></w:tblBorders>`
      : ""
  }<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${columns
    .map((width) => `<w:gridCol w:w="${width}"/>`)
    .join("")}</w:tblGrid>${rows}</w:tbl>`

const weiToAmount = (value: string): string => {
  const wei = BigInt(value)
  const base = BigInt(10) ** BigInt(18)
  const whole = wei / base
  const fraction = (wei % base).toString().padStart(18, "0").replace(/0+$/, "")
  return `${whole.toString()}${fraction ? `.${fraction}` : ""}`
}

const weiToDisplay = (value: string, currency: string): string => `${weiToAmount(value)} ${currency}`

const infoRow = (label: string, value: string, style: RunStyle = {}): string =>
  row(
    cell(paragraph(label, { after: 0 }), { width: INFO_COLUMNS[0], vAlign: "top" }) +
      cell(paragraph(":", { after: 0 }), { width: INFO_COLUMNS[1], vAlign: "top" }) +
      cell(paragraph(value || DOTS, { after: 0, ...style }), { width: INFO_COLUMNS[2], vAlign: "top" }),
  )

const sectionTitle = (value: string): string => paragraph(value, { bold: true, before: 240, after: 80, keepNext: true })

// Struktur & warna disalin dari kopsurat_mizan.docx: logo kiri, alamat kanan rata kanan, garis ungu di bawah.
const letterhead = (logoRelId: string): string => {
  const half = PAGE_WIDTH / 2
  const logo = `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${LETTERHEAD_LOGO_WIDTH_EMU}" cy="${LETTERHEAD_LOGO_HEIGHT_EMU}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="1" name="Mizan Logo"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="mizan-letterhead-logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${logoRelId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${LETTERHEAD_LOGO_WIDTH_EMU}" cy="${LETTERHEAD_LOGO_HEIGHT_EMU}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
  const logoCell = `<w:tc><w:tcPr><w:tcW w:w="${half}" w:type="dxa"/></w:tcPr><w:p>${logo}</w:p></w:tc>`
  const addressLines = [
    run("PT MIZAN TECH INDONESIA", { bold: true, color: "7C3AED", size: 28 }),
    `<w:r><w:rPr><w:b/><w:color w:val="7C3AED"/><w:sz w:val="28"/></w:rPr><w:br/></w:r>`,
    run("Jl. Jendral Sudirman No. 123, Jakarta Selatan, 12190", { color: "555555", size: 19 }),
    `<w:r><w:rPr><w:color w:val="555555"/><w:sz w:val="19"/></w:rPr><w:br/><w:t xml:space="preserve">Email: info@mizan.co.id | Telp: (021) 555-0199</w:t></w:r>`,
    `<w:r><w:rPr><w:color w:val="555555"/><w:sz w:val="19"/></w:rPr><w:br/><w:t xml:space="preserve">Website: www.mizan.co.id</w:t></w:r>`,
  ].join("")
  const addressCell = `<w:tc><w:tcPr><w:tcW w:w="${half}" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="right"/></w:pPr>${addressLines}</w:p></w:tc>`
  const headerTable = table([half, half], row(logoCell + addressCell), false)
  // Border ungu sesuai file asli (sz 18 = 2.25pt, #8B5CF6) — beda dari bottomBorder default paragraph() yang hitam.
  const divider = `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="18" w:space="1" w:color="8B5CF6"/></w:pBdr><w:spacing w:before="120" w:after="360"/></w:pPr></w:p>`
  return headerTable + divider
}

const itemsTable = (input: DisbursementDocumentInput): string => {
  const headers = [
    "No",
    "Nama item / keperluan",
    "Jumlah",
    "Satuan",
    `Harga satuan (${input.currency})`,
    `Subtotal (${input.currency})`,
  ]
  const header = row(
    headers
      .map((label, index) =>
        cell(paragraph(label, { bold: true, size: 20, align: "center", after: 0 }), {
          width: ITEM_COLUMNS[index],
          fill: "E7E6E6",
        }),
      )
      .join(""),
    { header: true },
  )

  let total = BigInt(0)
  const filledRows = input.items.map((item, index) => {
    const subtotal = BigInt(item.quantity) * BigInt(item.unitPriceWei)
    total += subtotal
    const values = [
      String(index + 1),
      item.name,
      String(item.quantity),
      item.unit,
      weiToAmount(item.unitPriceWei),
      weiToAmount(subtotal.toString()),
    ]
    return row(
      values
        .map((value, column) =>
          cell(paragraph(value, { align: ITEM_ALIGN[column], after: 0 }), { width: ITEM_COLUMNS[column] }),
        )
        .join(""),
      { height: ROW_HEIGHT },
    )
  })

  const blankCount = Math.max(0, (input.minRows ?? input.items.length) - input.items.length)
  const blankRows = Array.from({ length: blankCount }, (_, index) =>
    row(
      ITEM_COLUMNS.map((width, column) =>
        cell(paragraph(column === 0 ? String(input.items.length + index + 1) : "", { align: "center", after: 0 }), { width }),
      ).join(""),
      { height: ROW_HEIGHT },
    ),
  )

  const labelWidth = ITEM_COLUMNS.slice(0, 5).reduce((sum, width) => sum + width, 0)
  const totalRow = row(
    cell(paragraph("TOTAL", { bold: true, align: "right", after: 0 }), { width: labelWidth, span: 5 }) +
      cell(paragraph(input.items.length ? weiToAmount(total.toString()) : "", { bold: true, align: "right", after: 0 }), {
        width: ITEM_COLUMNS[5],
      }),
    { height: ROW_HEIGHT },
  )

  return table(ITEM_COLUMNS, header + filledRows.join("") + blankRows.join("") + totalRow)
}

const purposeBox = (text: string): string =>
  table(
    [PAGE_WIDTH],
    row(cell(text.trim() ? paragraphs(text.trim(), { after: 60 }) : paragraph("", { after: 0 }), { width: PAGE_WIDTH, vAlign: "top" }), {
      height: 1700,
    }),
  )

const signatureBlock = (input: DisbursementDocumentInput): string => {
  const half = PAGE_WIDTH / 2
  const left = paragraph("(stempel organisasi, jika ada)", { italic: true, size: 18, color: "7F7F7F", align: "center", before: 1100, after: 0 })
  const right =
    paragraph(`Tanggal: ${input.requestDate}`, { after: 0, keepNext: true }) +
    paragraph("Diajukan oleh,", { after: 0, keepNext: true }) +
    paragraph(input.requesterName, { bold: true, underline: true, before: 1300, after: 0, keepNext: true }) +
    paragraph(`Jabatan: ${".".repeat(30)}`, { after: 0 })
  return table(
    [half, half],
    row(cell(left, { width: half, vAlign: "top" }) + cell(right, { width: half, vAlign: "top" })),
    false,
  )
}

const documentXml = (input: DisbursementDocumentInput): string => {
  const body = [
    letterhead("rId2"),
    paragraph("SURAT PENGAJUAN PENCAIRAN DANA", { bold: true, size: 28, align: "center", before: 240, after: 60 }),
    paragraph("Dokumen pertanggungjawaban penggunaan dana campaign", { align: "center", after: 240 }),
    table(
      INFO_COLUMNS,
      [
        infoRow("Organisasi", input.organizationName, { bold: true }),
        infoRow("Nomor registrasi", input.registrationNumber ?? ""),
        infoRow("Campaign", input.campaignTitle),
        infoRow("Milestone", input.milestoneDescription),
        infoRow("Wallet tujuan", input.walletAddress),
        infoRow("Wilayah pembelian", input.region),
        infoRow("Nominal pencairan", weiToDisplay(input.requestedAmountWei, input.currency), { bold: true }),
      ].join(""),
      false,
    ),
    sectionTitle("Tujuan penggunaan dana"),
    purposeBox(input.description),
    sectionTitle("Rincian penggunaan dana"),
    itemsTable(input),
    paragraph(
      `Total rincian harus sama dengan nominal pencairan (${weiToDisplay(input.requestedAmountWei, input.currency)}). Tulis harga dalam ${input.currency}.`,
      { italic: true, size: 18, color: "595959", before: 80, after: 0 },
    ),
    sectionTitle("Pernyataan pertanggungjawaban"),
    paragraph(
      "Saya menyatakan bahwa dana yang diajukan akan digunakan sesuai rincian di atas dan dokumen ini dapat digunakan sebagai dokumentasi transparansi campaign.",
      { align: "both", after: 240, keepNext: true },
    ),
    signatureBlock(input),
    paragraph("", { after: 0 }),
  ].join("")

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`
}

export async function generateDisbursementDocx(input: DisbursementDocumentInput): Promise<Uint8Array> {
  const logoBytes = readFileSync(LETTERHEAD_LOGO_PATH)
  return createStoredZip([
    ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`],
    ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
    ["word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/mizan-letterhead-logo.png"/></Relationships>`],
    ["word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`],
    ["word/document.xml", documentXml(input)],
    ["word/media/mizan-letterhead-logo.png", logoBytes],
  ])
}

type ZipEntry = [name: string, content: string | Uint8Array]

// 1980-01-01 — nilai 0 untuk tanggal DOS itu tidak valid dan bikin sebagian tool unzip protes.
const DOS_DATE = 0x0021

function createStoredZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  for (const [name, content] of entries) {
    const nameBytes = Buffer.from(name, "utf8")
    const contentBytes = typeof content === "string" ? Buffer.from(content, "utf8") : Buffer.from(content)
    const checksum = crc32(contentBytes)
    const local = Buffer.alloc(30 + nameBytes.length + contentBytes.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(0, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(contentBytes.length, 18)
    local.writeUInt32LE(contentBytes.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    local.writeUInt16LE(0, 28)
    nameBytes.copy(local, 30)
    contentBytes.copy(local, 30 + nameBytes.length)
    localParts.push(local)

    const central = Buffer.alloc(46 + nameBytes.length)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(DOS_DATE, 14)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(contentBytes.length, 20)
    central.writeUInt32LE(contentBytes.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    nameBytes.copy(central, 46)
    centralParts.push(central)
    offset += local.length
  }
  const localBytes = Buffer.concat(localParts)
  const centralBytes = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBytes.length, 12)
  end.writeUInt32LE(localBytes.length, 16)
  return new Uint8Array(Buffer.concat([localBytes, centralBytes, end]))
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}
