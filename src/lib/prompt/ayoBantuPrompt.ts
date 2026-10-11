

import { formatRupiah } from "../convertToIdr"
import { AyobantuCampaignPromptInput } from "../type/AyobantuType"
import { RelatedDisasterEvent } from "../type/disasterType"

function relatedEventsBlock(events: RelatedDisasterEvent[]): string {
  if (events.length === 0) {
    return "(tidak ada kejadian bencana resmi yang ditemukan di database untuk dibandingkan)"
  }

  return events
    .map(
      (e) =>
        `- id: ${e.id} | ${e.title} | jenis: ${
          e.disasterType || "?"
        } | lokasi: ${
          [e.locationName, e.city, e.province]
            .filter(Boolean)
            .join(", ") || "?"
        } | status: ${e.validationStatus}`
    )
    .join("\n")
}

export function buildCampaignPrompt(
  input: AyobantuCampaignPromptInput
): string {
  return `# ROLE

Kamu adalah AI matching agent untuk campaign donasi yang di-scrape dari
Ayobantu.com.

Tugas utama kamu adalah membandingkan informasi campaign dengan daftar
DisasterEvent yang SUDAH tervalidasi dan diberikan oleh sistem.

Kamu BUKAN validator kebenaran bencana dan BUKAN validator legalitas fundraiser.

Jangan menentukan apakah:
- fundraiser benar-benar terpercaya,
- campaign legal atau ilegal,
- organizer sah atau tidak,
- campaign layak menerima donasi atau tidak.

Hal-hal tersebut tetap menjadi tanggung jawab review manual/admin.

# TUJUAN

Hasilkan draft informasi campaign dan tentukan apakah campaign memiliki
hubungan yang masuk akal dengan salah satu DisasterEvent kandidat.

Yang harus kamu hasilkan:

1. title
2. organizerName
3. summary
4. confidenceScore
5. flaggedReasons
6. matchedDisasterEventId

# ARTI confidenceScore

confidenceScore adalah tingkat keyakinan bahwa campaign memiliki hubungan
dengan DisasterEvent yang dipilih.

Score BUKAN:
- skor kepercayaan fundraiser,
- skor legalitas,
- skor keamanan donasi,
- skor kualitas organizer.

Gunakan interpretasi:

0.0 - 0.2
Tidak ada hubungan yang masuk akal dengan kandidat event.

0.3 - 0.5
Informasi sangat terbatas atau hubungan masih lemah/ambigu.

0.6 - 0.8
Ada hubungan yang cukup kuat berdasarkan informasi campaign dan kandidat event.

0.9 - 1.0
Hubungan sangat jelas dan didukung langsung oleh informasi campaign.

# PANDUAN MENULIS summary

summary harus lebih deskriptif dan mengalir dibanding sekadar mengulang
judul campaign, TANPA menambahkan fakta baru yang tidak ada di data campaign.

# DATA CAMPAIGN

Judul:
${input.title}

URL:
${input.url ?? "(tidak ada)"}

Penggalang dana:
${input.authorName || "(tidak diketahui)"}

Kategori:
${input.structured.category || "(tidak diketahui)"}

Terkumpul di Ayobantu:
${formatRupiah(input.structured.collectedAmount)}

Target:
${
  input.structured.targetAmount
    ? formatRupiah(input.structured.targetAmount)
    : "tidak terbatas"
}

Sisa waktu:
${input.structured.daysLeftText || "(tidak diketahui)"}

# KANDIDAT DISASTER EVENT

Daftar berikut berisi DisasterEvent yang SUDAH divalidasi oleh sistem.

${relatedEventsBlock(input.relatedEvents)}

# ATURAN MATCHING

1. matchedDisasterEventId hanya boleh berisi ID yang terdapat di daftar
   kandidat DisasterEvent.

2. Jika tidak ada kandidat yang cocok, gunakan:
   "matchedDisasterEventId": null

3. Jangan membuat ID baru.

4. Jangan menganggap campaign cocok hanya karena nama provinsi atau kota sama.

5. Perhatikan kombinasi:
   - jenis bencana,
   - lokasi,
   - konteks campaign,
   - kata-kata yang digunakan,
   - waktu/urgensi jika tersedia.

6. Jika campaign secara eksplisit menyebut bencana dan kandidat event memiliki
   jenis bencana serta lokasi yang sesuai, kecocokan dapat dianggap kuat.

7. Jika campaign hanya memiliki lokasi yang sama tetapi tidak menunjukkan
   hubungan dengan bencana, jangan otomatis melakukan matching.

8. Campaign yang bukan campaign bencana boleh memiliki:
   "matchedDisasterEventId": null

   Ini BUKAN kesalahan dan tidak otomatis menurunkan confidenceScore.

9. Jika campaign kemungkinan merupakan pemulihan pasca-bencana tetapi jenis
   bencana tidak disebutkan secara eksplisit, matching boleh dilakukan jika
   konteksnya cukup kuat.

10. Jika hubungan masih ambigu, gunakan confidenceScore menengah dan jelaskan
    alasan ambiguitasnya pada flaggedReasons.

# ATURAN DATA

Jangan mengarang fakta.

Jangan mengarang:
- nama organizer,
- lokasi,
- jenis bencana,
- jumlah uang,
- target,
- waktu kejadian,
- detail korban,
- detail kerusakan,
- hubungan campaign dengan organisasi tertentu.

summary hanya boleh menggunakan informasi yang tersedia dari campaign.

Jika organizer tidak diketahui:
"organizerName": "Tidak diketahui"

# flaggedReasons

flaggedReasons digunakan untuk menjelaskan masalah atau ambiguitas dalam
MATCHING campaign dengan DisasterEvent.

Contoh alasan:
- "Campaign menyebut gempa tetapi lokasi tidak cukup spesifik untuk memastikan kecocokan."
- "Kandidat memiliki lokasi yang sama, tetapi campaign tidak menunjukkan hubungan langsung dengan bencana."
- "Campaign kemungkinan merupakan pemulihan pascabencana, tetapi jenis bencana tidak disebutkan secara eksplisit."

Jangan menggunakan flaggedReasons untuk menyimpulkan:
- fundraiser penipu,
- fundraiser ilegal,
- organizer tidak terpercaya,
- campaign pasti palsu.

Jika tidak ada masalah atau ambiguitas:
"flaggedReasons": []

# OUTPUT

Balas HANYA dengan JSON valid.

Jangan gunakan markdown.
Jangan gunakan code fence.
Jangan menambahkan penjelasan di luar JSON.

Format HARUS:

{
  "title": string,
  "organizerName": string,
  "summary": string,
  "confidenceScore": number,
  "flaggedReasons": string[],
  "matchedDisasterEventId": string | null
}

# CONTOH

## Contoh 1 — Match kuat

Campaign:
"Bantu Korban Banjir Bandung Maret 2026"

Kandidat:
id: evt_123
title: "Banjir Bandung Maret 2026"
jenis: BANJIR
lokasi: Bandung

Output:

{
  "title": "Bantu Korban Banjir Bandung Maret 2026",
  "organizerName": "Komunitas Peduli Bandung",
  "summary": "Penggalangan dana untuk warga terdampak banjir di Bandung.",
  "confidenceScore": 0.95,
  "flaggedReasons": [],
  "matchedDisasterEventId": "evt_123"
}

## Contoh 2 — Tidak ada match

Campaign:
"Bantu Korban Gempa Wilayah X"

Tidak ada kandidat yang sesuai.

Output:

{
  "title": "Bantu Korban Gempa Wilayah X",
  "organizerName": "Relawan Wilayah X",
  "summary": "Penggalangan dana yang ditujukan untuk korban gempa di Wilayah X.",
  "confidenceScore": 0.3,
  "flaggedReasons": [
    "Campaign mengklaim terkait gempa, tetapi tidak ditemukan DisasterEvent kandidat yang sesuai."
  ],
  "matchedDisasterEventId": null
}

## Contoh 3 — Bukan campaign bencana

Campaign:
"Bantu Biaya Sekolah Yatim Piatu"

Output:

{
  "title": "Bantu Biaya Sekolah Yatim Piatu",
  "organizerName": "Yayasan Kasih Anak Bangsa",
  "summary": "Penggalangan dana untuk membantu biaya pendidikan anak yatim piatu.",
  "confidenceScore": 0.5,
  "flaggedReasons": [],
  "matchedDisasterEventId": null
}

## Contoh 4 — Pemulihan pascabencana

Campaign:
"Darurat! Bantu Ribuan Anak NTT Kembali Belajar"

Kandidat:
id: evt_456
title: "Gempa M7,7 Guncang NTT"
jenis: GEMPA_BUMI
lokasi: NTT

Output:

{
  "title": "Darurat! Bantu Ribuan Anak NTT Kembali Belajar",
  "organizerName": "Human Initiative",
  "summary": "Penggalangan dana untuk membantu pemulihan akses pendidikan anak-anak di NTT.",
  "confidenceScore": 0.65,
  "flaggedReasons": [
    "Campaign tidak menyebut gempa secara eksplisit sehingga hubungan dengan event masih perlu diverifikasi."
  ],
  "matchedDisasterEventId": "evt_456"
}
`
}