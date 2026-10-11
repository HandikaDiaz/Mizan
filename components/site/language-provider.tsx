"use client"

import * as React from "react"

export type Language = "id" | "en"

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  isEnglish: boolean
  t: (text: string) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

const ENGLISH: Record<string, string> = {
  Dashboard: "Dashboard",
  Ringkasan: "Overview",
  "Kampanye Saya": "My Campaigns",
  "Filter kampanye": "Campaign filter",
  "Belum ada kampanye": "No campaigns yet",
  "Buat kampanye pertama untuk mulai mengelola penyaluran organisasi Anda.":
    "Create your first campaign to start managing your organization's disbursements.",
  "Dana terkumpul": "Funds raised",
  "Belum ada milestone": "No milestones yet",
  "Panel Admin": "Admin Panel",
  "Ringkasan Platform": "Platform Overview",
  "Aktivitas terbaru": "Recent activity",
  "Penyaluran dana": "Fund disbursement",
  "Tambah Kampanye": "Add Campaign",
  Kampanye: "Campaigns",
  "Cari judul, penyelenggara, atau sumber AI…":
    "Search title, organizer, or AI source…",
  "Filter sumber kampanye": "Filter campaign source",
  "Semua sumber": "All sources",
  "AI Mizan": "Mizan AI",
  Manual: "Manual",
  "Tidak ada campaign yang sesuai filter.": "No campaigns match the filter.",
  "Approve campaign AI": "Approve AI campaign",
  "Admin Mizan": "Mizan Admin",
  "Kampanye / AI source": "Campaign / AI source",
  Target: "Target",
  Review: "Review",
  Aksi: "Actions",
  "Confidence AI": "AI confidence",
  Recipient: "Recipient",
  Approve: "Approve",
  Reject: "Reject",
  "Draft kampanye dibuat oleh AI mock, lalu harus ditinjau admin sebelum aktif.":
    "Campaign drafts are created by mock AI and must be reviewed by an admin before activation.",
  "Judul kampanye": "Campaign title",
  Penyelenggara: "Organizer",
  "Tipe kampanye": "Campaign type",
  "Target dana (BNB)": "Funding target (BNB)",
  "Sisa hari kampanye": "Campaign days remaining",
  "Wallet komunitas": "Community wallet",
  "Deskripsi singkat": "Short description",
  "Gambar sampul": "Cover image",
  "Hapus gambar": "Remove image",
  "Belum ada gambar": "No image yet",
  "Mengunggah…": "Uploading…",
  "Unggah gambar": "Upload image",
  "Source / reference AI": "AI source / reference",
  "Menyimpan…": "Saving…",
  "Lengkapi nominal dan rincian item dengan format yang valid.":
    "Complete the amount and item details using a valid format.",
  "Template gagal dibuat.": "The template could not be created.",
  "Template berhasil diunduh. Tanda tangani dokumen lalu upload kembali.":
    "The template was downloaded successfully. Sign the document and upload it again.",
  "Upload dokumen PDF, DOC, atau DOCX yang sudah ditandatangani.":
    "Upload a signed PDF, DOC, or DOCX document.",
  "Pengajuan gagal diproses.": "The request could not be processed.",
  "Pengajuan berhasil diproses dengan status": "Request processed with status",
  "Kampanye akan diajukan untuk ditinjau Admin sebelum tampil ke publik.":
    "The campaign will be submitted for Admin review before it appears publicly.",
  "Total eligible": "Total eligible",
  "Sudah dicairkan": "Already disbursed",
  "Kelola milestone": "Manage milestones",
  "Kirim bukti penggunaan dana": "Submit fund usage proof",
  "Dokumen pengajuan pencairan": "Disbursement request document",
  "Isi rincian, unduh template, tanda tangani, lalu upload PDF, DOC, atau DOCX.":
    "Fill in the details, download the template, sign it, then upload the PDF, DOC, or DOCX.",
  Penyaluran: "Disbursements",
  Donatur: "Donors",
  Pengaturan: "Settings",
  "Simpan perubahan": "Save changes",
  Simpan: "Save",
  Batal: "Cancel",
  Tutup: "Close",
  Kembali: "Back",
  Berikutnya: "Next",
  Aktif: "Active",
  "Menunggu Persetujuan": "Awaiting approval",
  Selesai: "Completed",
  Ditutup: "Closed",
  Draft: "Draft",
  Sebelumnya: "Previous",
  Buat: "Create",
  Edit: "Edit",
  Hapus: "Delete",
  Filter: "Filter",
  Semua: "All",
  "Belum ada data": "No data yet",
  "Memuat data…": "Loading data…",
  "Terjadi kesalahan": "Something went wrong",
  "Coba lagi": "Try again",
  "Berhasil disimpan": "Saved successfully",
  "Perubahan berhasil disimpan": "Changes saved successfully",
  "Kampanye aktif": "Active campaigns",
  "Total dana": "Total funds",
  "Total terkumpul": "Total raised",
  "Total tersalur": "Total disbursed",
  "Total donatur": "Total donors",
  "Jumlah donatur": "Donor count",
  "Kampanye terbaru": "Latest campaigns",
  "Tidak ada kampanye": "No campaigns",
  "Belum ada kampanye.": "No campaigns yet.",
  "Kampanye belum tersedia.": "No campaigns available yet.",
  "Edit Kampanye": "Edit Campaign",
  "Detail Kampanye": "Campaign Details",
  "Campaign tidak ditemukan": "Campaign not found",
  "Profil organisasi": "Organization profile",
  "Profil penerima": "Beneficiary profile",
  "Informasi pribadi": "Personal information",
  "Data organisasi": "Organization data",
  "Nomor telepon": "Phone number",
  "Alamat email": "Email address",
  "Nomor registrasi": "Registration number",
  "Alamat wallet": "Wallet address",
  "Belum diisi": "Not provided",
  "Status verifikasi": "Verification status",
  "Belum dimulai": "Not started",
  "Sedang diproses": "In progress",
  Milestone: "Milestone",
  "Daftar milestone": "Milestone list",
  "Buat milestone": "Create milestone",
  "Unggah bukti": "Upload proof",
  "Ajukan pencairan": "Request disbursement",
  "Kampanye berhasil diperbarui": "Campaign updated successfully",
  "Kampanye berhasil dihapus": "Campaign deleted successfully",
  "Dokumen wajib diunggah": "A document is required",
  "Dokumen pencairan": "Disbursement document",
  "Transaction hash (opsional)": "Transaction hash (optional)",
  "Terjadi kesalahan saat memproses milestone.":
    "An error occurred while processing the milestone.",
  "Belum ada bukti": "No proof yet",
  Tahap: "Stage",
  Opsional: "Optional",
  "Pilih PDF/DOC/DOCX bertanda tangan": "Choose a signed PDF/DOC/DOCX",
  "Unduh template": "Download template",
  "Kirim untuk dianalisis": "Submit for analysis",
  "Wilayah pembelian": "Purchase region",
  "Deskripsi penggunaan dana": "Fund usage description",
  Item: "Item",
  Jumlah: "Quantity",
  "Harga satuan": "Unit price",
  "Memuat riwayat payment...": "Loading payment history...",
  "Login diperlukan untuk melihat riwayat wallet ini.":
    "Login is required to view this wallet history.",
  "Belum ada payment dari wallet ini.": "No payments from this wallet yet.",
  "Riwayat payment gagal dimuat": "Payment history could not be loaded",
  "Buka transaction hash": "Open transaction hash",
  "Kembali ke ringkasan": "Back to overview",
  Organisasi: "Organization",
  "Informasi organisasi yang digunakan saat kampanye ditinjau dan dana disalurkan.":
    "Organization information used when campaigns are reviewed and funds are disbursed.",
  "Community ID": "Community ID",
  "Dompet penerima": "Recipient wallet",
  "Lihat dompet di BscScan ↗": "View wallet on BscScan ↗",
  "Informasi publik": "Public information",
  "Data berikut dapat dilihat donatur melalui halaman profil organisasi.":
    "Donors can view the following information on the organization profile.",
  Website: "Website",
  "Email kontak": "Contact email",
  "Nomor kontak": "Contact number",
  Alamat: "Address",
  Legalitas: "Legal information",
  "Status verifikasi legalitas dikelola oleh Admin Mizan. Perubahan data akan ditinjau kembali sebelum status berubah.":
    "Legal verification is managed by Mizan Admin. Data changes will be reviewed before the status changes.",
  "Masukkan nomor registrasi": "Enter registration number",
  "Dokumen legalitas": "Legal document",
  "Ajukan perubahan profil": "Submit profile changes",
  "Hanya owner organisasi yang dapat mengubah data profil.":
    "Only the organization owner can edit profile data.",
  "Data testnet — dana tidak nyata.":
    "Testnet data — funds have no real value.",
  "Penerima Manfaat": "Beneficiary",
  "Kelola kampanye, milestone, bukti penggunaan dana, dan pencairan.":
    "Manage campaigns, milestones, fund usage proof, and disbursements.",
  "Ringkasan Dana": "Funds Overview",
  "Penyaluran & Milestone": "Disbursements & Milestones",
  "Status verifikasi bukti penyaluran dan pencairan dana.":
    "Verification status of distribution proof and fund disbursement.",
  "Campaign terbaru organisasi": "Organization's latest campaigns",
  "Menampilkan maksimal tiga campaign terbaru. Daftar lengkap tersedia di halaman Campaign Saya.":
    "Showing up to three latest campaigns. The full list is available on My Campaigns.",
  "Organisasi ini belum memiliki campaign.":
    "This organization has no campaigns yet.",
  Dibuat: "Created",
  "Menunggu review": "Awaiting review",
  Disetujui: "Approved",
  "Dashboard Donatur": "Donor Dashboard",
  "Ringkasan Donasi": "Donation Overview",
  "Payment terkonfirmasi": "Confirmed payments",
  "Progres dihitung dari CampaignPayment berstatus CONFIRMED di database.":
    "Progress is calculated from CONFIRMED CampaignPayment records in the database.",
  "Belum ada campaign aktif yang disetujui admin.":
    "No active campaigns approved by admin yet.",
  "Riwayat transaksi wallet": "Wallet transaction history",
  "Payment MOCK dan ONCHAIN milik wallet Privy yang sedang login.":
    "MOCK and ONCHAIN payments for the currently logged-in Privy wallet.",
  "Dukung campaign aktif": "Support an active campaign",
  "Simulasi tersimpan di database tanpa blockchain. On-chain memakai BSC Testnet dan saldo tBNB.":
    "Simulation is stored in the database without blockchain. On-chain uses BSC Testnet and tBNB balance.",
  "Belum ada campaign aktif yang siap menerima payment.":
    "No active campaign is ready to receive payment.",
  Campaign: "Campaign",
  "Saldo campaign terkonfirmasi": "Confirmed campaign balance",
  "Simulasi DB": "DB simulation",
  "On-chain BSC Testnet": "BSC Testnet on-chain",
  "Bayar simulasi": "Pay with simulation",
  "Bayar dengan wallet": "Pay with wallet",
  "Memproses…": "Processing…",
  "Login dan wallet Ethereum diperlukan untuk membayar.":
    "Login and an Ethereum wallet are required to pay.",
  "Nominal BNB tidak valid. Gunakan maksimal 18 angka desimal.":
    "Invalid BNB amount. Use up to 18 decimal places.",
  "Pilih campaign terlebih dahulu.": "Choose a campaign first.",
  "Mock payment berhasil dicatat.": "Mock payment recorded successfully.",
  "Transaksi menunggu konfirmasi.": "Transaction is awaiting confirmation.",
  "Payment gagal": "Payment failed",
  kampanye: "campaigns",
  payment: "payments",
  milestone: "milestones",
  "Bukti wajib diunggah": "Proof is required",
  Nominal: "Amount",
  Satuan: "Unit",
  Deskripsi: "Description",
  Kategori: "Category",
  Lokasi: "Location",
  "Target dana": "Funding target",
  "Sisa hari": "Days remaining",
  "Tanggal dibuat": "Created date",
  "Terakhir diperbarui": "Last updated",
  Confidence: "Confidence",
  Keputusan: "Decision",
  "Ringkasan dana": "Funds overview",
  "Dana diterima": "Funds received",
  "Dana dicairkan": "Funds disbursed",
  "Donasi masuk": "Incoming donations",
  "Riwayat donasi": "Donation history",
  "Donasi saya": "My donations",
  "Tidak ada riwayat donasi.": "No donation history yet.",
  "Jelajahi kampanye": "Explore campaigns",
  "Lihat detail": "View details",
  "Lihat semua": "View all",
  "Perbarui profil": "Update profile",
  "Donasi Saya": "My Donations",
  "Jelajahi Kampanye": "Explore Campaigns",
  Admin: "Admin",
  Dompet: "Wallet",
  "Dompet terhubung": "Connected wallet",
  "Salin alamat dompet": "Copy wallet address",
  "Pilih bahasa": "Choose language",
  "Histori penggunaan dana": "Fund usage history",
  "Histori penyaluran organisasi": "Organization disbursement history",
  "Belum ada penyaluran yang dipublikasikan": "No published disbursements yet",
  "Histori akan muncul setelah milestone selesai disalurkan dan berstatus DISBURSED.":
    "History will appear after a milestone is disbursed and marked DISBURSED.",
  penyaluran: "disbursements",
  Wilayah: "Region",
  "Tanggal belum tersedia": "Date unavailable",
  Bahasa: "Language",
  Indonesia: "Indonesian",
  Inggris: "English",
  "Keluar…": "Logging out…",
  "Detail kampanye": "Campaign details",
  "Buat Kampanye Baru": "Create New Campaign",
  "Buat Kampanye": "Create Campaign",
  "Kampanye berhasil dibuat": "Campaign created successfully",
  "Menunggu Review Admin": "Awaiting admin review",
  "Perlu diperiksa": "Needs review",
  "AI terverifikasi": "AI verified",
  Ditolak: "Rejected",
  "Siap dicairkan": "Ready for disbursement",
  "Sudah disalurkan": "Disbursed",
  "Belum ada milestone.": "No milestones yet.",
  "Belum ada output AI.": "No AI output yet.",
  "Belum ada catatan.": "No note yet.",
  "Catatan penggunaan dana": "Fund usage note",
  "Output verifikasi Langflow": "Langflow verification output",
  "Lihat bukti": "View proof",
  Setujui: "Approve",
  Tolak: "Reject",
  "Tandai disalurkan": "Mark as disbursed",
  Konfirmasi: "Confirm",
  "Memuat halaman…": "Loading page…",
  Zakat: "Zakat",
  "Cara Kerja": "How It Works",
  Transparansi: "Transparency",
  "Tanya Jawab": "FAQ",
  "Hubungkan Dompet": "Connect Wallet",
  "Tutup menu": "Close menu",
  "Buka menu": "Open menu",
  "Mizan — kembali ke beranda": "Mizan — back to home",
  "Navigasi utama": "Main navigation",
  "Navigasi seluler": "Mobile navigation",
  "Memuat…": "Loading…",
  "Akun terhubung": "Connected account",
  Keluar: "Log out",
  "Zakat & donasi on-chain": "Zakat & on-chain donations",
  "Setiap dana punya jejaknya.": "Every donation leaves a trace.",
  "Setiap dana punya": "Every donation leaves a",
  "jejaknya.": "trace.",
  "Donasi masuk ke kontrak pintar di BNB Smart Chain, bukan ke rekening kami. Setiap pencairan ke penerima tercatat di blockchain dan bisa kamu periksa sendiri — kapan saja, tanpa perlu izin siapa pun.":
    "Donations go to a smart contract on BNB Smart Chain, not our bank account. Every payout to a recipient is recorded on-chain and can be checked by anyone, anytime, without permission.",
  "Donasi Sekarang": "Donate Now",
  "Lihat Alur Dana": "View Fund Flow",
  "Data uji testnet": "Testnet data",
  "Dana ditahan kontrak": "Funds held by contract",
  "Tanpa perantara": "No middleman",
  "Bukti on-chain": "On-chain proof",
  "Jaringan uji": "Test network",
  "BNB Smart Chain Testnet, bukan mainnet.":
    "BNB Smart Chain Testnet, not mainnet.",
  "Transaksi tercatat": "Recorded transactions",
  "Setiap donasi dan penyaluran membuat jejak permanen.":
    "Every donation and payout creates a permanent trace.",
  "Pencairan bertahap": "Milestone payouts",
  "Dana keluar hanya setelah bukti penyaluran diverifikasi.":
    "Funds are released only after payout evidence is verified.",
  "Periksa di BscScan": "Check on BscScan",
  "Kategori penyaluran": "Distribution categories",
  "Aturan penyalurannya beda, jadi dipisah.":
    "Different distribution rules deserve separate paths.",
  "Zakat punya ketentuan penerima yang ketat; donasi umum tidak. Mencampur keduanya dalam satu keranjang justru menyulitkan pertanggungjawaban.":
    "Zakat has strict recipient rules; general donations do not. Keeping them separate makes accountability easier.",
  "8 asnaf": "8 asnaf",
  "Ditakar sesuai nisab dan disalurkan ke golongan yang berhak.":
    "Measured by nisab and distributed to eligible recipients.",
  "Bantuan pendidikan untuk 40 anak yatim di Lombok Timur":
    "Education support for 40 orphans in East Lombok",
  "Biaya sekolah, seragam, dan perlengkapan belajar selama satu tahun ajaran untuk 40 anak. Dana dicairkan tiga kali, mengikuti bukti penerimaan dari sekolah.":
    "School fees, uniforms, and learning supplies for 40 children for one academic year. Funds are released in three stages after the school confirms receipt.",
  "Komunitas pendidikan yang mendampingi anak yatim dan keluarga rentan di Lombok Timur.":
    "An education community supporting orphans and vulnerable families in East Lombok.",
  "Air bersih untuk 120 kepala keluarga di Sumba Timur":
    "Clean water for 120 families in East Sumba",
  "Sumur bor dan penampungan air untuk tiga dusun yang selama ini menempuh 4 km untuk mengambil air.":
    "A borewell and water reservoir for three villages whose residents currently walk 4 km to collect water.",
  "Relawan lokal yang memperjuangkan akses air bersih untuk keluarga di Sumba Timur.":
    "Local volunteers working to provide clean water access for families in East Sumba.",
  "Modal usaha untuk 25 ibu tunggal di Bantul":
    "Business capital for 25 single mothers in Bantul",
  "Zakat produktif berupa modal dan pendampingan usaha selama enam bulan, disalurkan bertahap per kelompok.":
    "Productive zakat in the form of business capital and six months of mentoring, distributed in group stages.",
  "Komunitas pendamping usaha mikro yang membantu ibu tunggal membangun penghasilan yang berkelanjutan.":
    "A microbusiness community helping single mothers build sustainable income.",
  "Logistik tiga posko pengungsian di Cianjur":
    "Logistics for three evacuation posts in Cianjur",
  "Tenda, air bersih, dan dapur umum untuk tiga posko. Pencairan mengikuti kuitansi harian dari koordinator lapangan.":
    "Tents, clean water, and community kitchens for three evacuation posts. Payouts follow daily receipts from field coordinators.",
  "Jaringan relawan yang menyalurkan bantuan darurat secara langsung ke posko pengungsian.":
    "A volunteer network delivering emergency aid directly to evacuation posts.",
  "Donasi Umum": "General Donation",
  Wakaf: "Waqf",
  "Tanggap Bencana": "Disaster Relief",
  Bebas: "Flexible",
  "Aset tetap": "Fixed asset",
  Mendesak: "Urgent",
  "Untuk kebutuhan mendesak yang tidak masuk ketentuan zakat.":
    "For urgent needs outside zakat distribution rules.",
  "Pokoknya dijaga, manfaatnya mengalir jangka panjang.":
    "The principal is preserved while its benefits continue long term.",
  "Pencairan dipercepat dengan verifikasi dua tahap.":
    "Payouts are accelerated with two-step verification.",
  "Yang sedang berjalan": "Active campaigns",
  "Pilih kampanye yang ingin kamu dukung. Setiap pencairan tercatat dan dapat diperiksa siapa pun.":
    "Choose a campaign to support. Every payout is recorded and open for anyone to verify.",
  "Lihat semua kampanye": "View all campaigns",
  "Lihat kampanye": "View campaign",
  sisa: "left",
  hari: "days",
  target: "target",
  terkonversi: "converted",
  tercapai: "reached",
  donatur: "donors",
  Profil: "Profile",
  "Yayasan terverifikasi": "Verified foundation",
  "Komunitas lokal terverifikasi": "Verified local community",
  "Data community terverifikasi": "Verified data community",
  "Relawan terverifikasi": "Verified volunteers",
  "Cara kerja + transparansi": "How it works + transparency",
  "Dari dompet sampai penerima, setiap langkah punya jejak.":
    "From wallet to recipient, every step leaves a trace.",
  "Ikuti perjalanan satu donasi. Gulir perlahan untuk melihat apa yang terjadi pada dana kamu di setiap tahap.":
    "Follow one donation from start to finish. Scroll slowly to see what happens to your funds at every stage.",
  "Scroll untuk menjelajah": "Scroll to explore",
  "Mulai dari sini": "Start here",
  "Transaksi pertama": "First transaction",
  "Tercatat on-chain": "Recorded on-chain",
  "Sebelum dana cair": "Before funds are released",
  "Selesai disalurkan": "Successfully distributed",
  "Hubungkan dompet": "Connect your wallet",
  "Donasi masuk ke kontrak": "Donation enters the contract",
  "Kontrak mencatat niat": "The contract records intent",
  "Bukti penyaluran diverifikasi": "Distribution evidence is verified",
  "Dana sampai ke penerima": "Funds reach the recipient",
  Langkah: "STEP",
  "Buka contoh transaksi": "Open example transaction",
  "Cukup dompet yang mendukung BNB Smart Chain. Tidak ada pendaftaran, tidak ada unggah KTP.":
    "All you need is a wallet that supports BNB Smart Chain. No registration and no ID upload.",
  "Tidak ada data pribadi yang disimpan.": "No personal data is stored.",
  "Dana tidak masuk ke rekening kami. Dana masuk ke kontrak pintar yang alamatnya bisa kamu periksa sendiri di BscScan.":
    "Funds do not enter our account. They go to a smart contract whose address you can check on BscScan.",
  "Dana tidak masuk ke rekening pengelola. Donasi langsung dikirim ke kontrak pintar yang alamatnya terbuka untuk diperiksa.":
    "Funds do not enter an operator account. Donations go directly to a smart contract with a public address.",
  "Setiap kiriman meninggalkan transaksi yang bisa ditelusuri.":
    "Every transfer leaves a traceable transaction.",
  "Kontrak menahan dana dan mencatat tujuan donasi. Tidak ada pihak yang bisa memindahkan dana secara sepihak.":
    "The contract holds the funds and records the donation purpose. No party can move funds unilaterally.",
  "Alamat kontrak dan blok transaksi tersedia untuk audit publik.":
    "The contract address and transaction block are available for public audit.",
  "Pencairan tertahan sampai bukti dan milestone terpenuhi.":
    "Payouts remain locked until evidence and milestones are complete.",
  "Penyelenggara mengunggah bukti penyaluran. Setelah diverifikasi, dana cair ke dompet penerima — bukan ke dompet pengelola.":
    "The organizer uploads distribution evidence. Once verified, funds go to the recipient wallet — not the operator wallet.",
  "Sisa dana yang tidak tersalur dikembalikan ke donatur.":
    "Undistributed funds are returned to donors.",
  "Hash transaksi tujuan bisa dibuka siapa pun di explorer.":
    "Anyone can open the destination transaction hash in the explorer.",
  "Yang dibutuhkan": "What you need",
  "Dompet BNB Smart Chain": "A BNB Smart Chain wallet",
  "Data pribadi": "Personal data",
  "Tidak ada pendaftaran": "No registration",
  Pengirim: "Sender",
  "Nilai demo": "Demo value",
  Kontrak: "Contract",
  "Blok demo": "Demo block",
  Status: "Status",
  "Menunggu bukti": "Awaiting evidence",
  Aturan: "Rule",
  "Milestone wajib lolos": "Milestone must pass",
  Penerima: "Recipient",
  "Suara dari lapangan": "A voice from the field",
  "Bukti penyaluran": "Distribution proof",
  "Penyaluran tahap": "Distribution stage",
  Diterima: "Received",
  "Penerima manfaat": "Beneficiaries",
  "Sekarang saya bisa lihat sendiri uangnya sampai ke mana. Dulu saya cuma bisa percaya pada kata-kata.":
    "Now I can see where the money goes. Before, I could only trust words.",
  "Koordinator lapangan, Lombok Timur": "Field coordinator, East Lombok",
  "Menerima penyaluran tahap kedua pada 14 Agustus. Bukti penyaluran dan transaksi pencairannya terbuka untuk diperiksa siapa pun.":
    "Received the second distribution on August 14. The distribution evidence and payout transaction are open for anyone to verify.",
  "Periksa transaksinya": "Check the transaction",
  "TANYA JAWAB": "FAQ",
  "Jawaban untuk hal yang paling penting.": "Answers to what matters most.",
  "Apa yang membuat ini beda dari platform donasi biasa?":
    "What makes this different from a regular donation platform?",
  "Di platform biasa, kamu menyerahkan dana lalu tidak bisa melihat lagi ke mana perginya. Di sini dana masuk ke kontrak pintar yang alamatnya publik, dan setiap pencairan ke penerima tercatat sebagai transaksi yang bisa kamu periksa sendiri kapan saja.":
    "On a regular platform, you give money and cannot see where it goes. Here, funds enter a smart contract with a public address, and every payout is recorded as a transaction you can check anytime.",
  "Apakah pengelola bisa membawa kabur dananya?":
    "Can the operator take the funds?",
  "Tidak sepihak. Dana ditahan kontrak, bukan ditahan orang. Pencairan hanya bisa terjadi bila syarat milestone terpenuhi, dan alasannya tercatat di blockchain. Kalau kampanye gagal mencapai target, dana dikembalikan ke donatur.":
    "Not unilaterally. Funds are held by the contract, not a person. Payouts can happen only when milestone conditions are met, with the reason recorded on-chain. If a campaign misses its target, funds are returned to donors.",
  "Bagaimana kalau laporan penyalurannya palsu?":
    "What if the distribution report is false?",
  "Setiap laporan wajib disertai bukti yang bisa ditelusuri — kuitansi, foto berlokasi, atau tanda terima penerima. Bukti yang tidak lolos verifikasi membuat pencairan tertahan, bukan otomatis cair. Verifikasi otomatis akan ditangani agen AI pada tahap berikutnya; untuk sekarang prosesnya masih manual dan setiap keputusan dicatat.":
    "Every report must include traceable evidence — receipts, geotagged photos, or recipient acknowledgements. Evidence that fails verification keeps the payout locked. Automated verification may come later; for now the process is manual and every decision is recorded.",
  "Apakah saya harus paham kripto untuk ikut?":
    "Do I need to understand crypto to participate?",
  "Tidak perlu paham. Kamu perlu satu dompet yang mendukung BNB Smart Chain, dan hanya itu. Istilah seperti biaya jaringan akan ditampilkan dalam bentuk angka yang jelas sebelum kamu menekan tombol konfirmasi.":
    "No. You only need a wallet that supports BNB Smart Chain. Network fees and other terms are shown as clear numbers before you confirm.",
  "Apakah ini sudah dipakai untuk dana sungguhan?":
    "Is this already used for real funds?",
  "Belum. Seluruh data di halaman ini berjalan di BNB Smart Chain Testnet — jaringan uji yang dananya tidak punya nilai. Kami tidak akan mengumpulkan dana nyata sebelum kontraknya selesai diaudit pihak ketiga.":
    "Not yet. All data on this page runs on BNB Smart Chain Testnet, where funds have no real value. We will not collect real funds before a third-party audit is complete.",
  "Berapa biaya yang dipotong?": "How much is deducted in fees?",
  "Hanya biaya jaringan dari blockchain, yang langsung dibayarkan ke jaringan — bukan ke kami. Tidak ada potongan pengelola pada versi ini, dan kalau nanti ada, besarnya harus tertulis di kontrak sehingga tidak bisa diubah diam-diam.":
    "Only the blockchain network fee is charged directly by the network, not by us. This version has no operator fee; any future fee must be written in the contract and cannot be changed silently.",
  "Cari tahu bagaimana dana dijaga, dicatat, dan bisa kamu periksa sendiri sebelum mulai berdonasi.":
    "Learn how funds are protected, recorded, and independently verifiable before you donate.",
  "Cari pertanyaan": "Search questions",
  "Cari pertanyaan...": "Search questions...",
  Cari: "Search",
  "Topik bantuan": "Help topics",
  "Semua pertanyaan": "All questions",
  "Penggunaan umum": "General usage",
  "Keamanan dana": "Fund security",
  "Bukti & transparansi": "Proof & transparency",
  "Bantuan lainnya": "Other help",
  "Pertanyaan umum": "General questions",
  "jawaban tersedia": "answers available",
  "Belum ada jawaban yang cocok.": "No matching answers yet.",
  "Coba kata kunci lain atau pilih topik bantuan yang berbeda.":
    "Try another keyword or choose a different help topic.",
  Jelajahi: "Explore",
  Bantuan: "Help",
  "Tetap terhubung": "Stay connected",
  "Platform zakat dan donasi yang menaruh dana di kontrak pintar, bukan di rekening pengelola. Setiap pencairan tercatat dan bisa diperiksa siapa pun.":
    "A zakat and donation platform that puts funds in a smart contract, not an operator account. Every payout is recorded and open to everyone.",
  "Jejak dana dapat diaudit": "Fund trail is auditable",
  "Dapatkan kabar terbaru tentang kampanye dan transparansi Mizan.":
    "Get updates about Mizan campaigns and transparency.",
  "Email kamu...": "Your email...",
  "Email kamu": "Your email",
  "Daftar informasi Mizan": "Subscribe to Mizan updates",
  "Tidak ada spam. Hanya kabar penting tentang dana dan penerima.":
    "No spam. Only important updates about funds and recipients.",
  "Dokumentasi kontrak": "Contract documentation",
  "Kontrak di BscScan": "Contract on BscScan",
  "Data demo di BNB Smart Chain Testnet — dana tidak nyata.":
    "Demo data on BNB Smart Chain Testnet — funds have no real value.",
  "Jaringan uji · chain ID": "Test network · chain ID",
  "Kampanye terverifikasi": "Verified campaign",
  "Kembali ke kampanye": "Back to campaigns",
  "hari lagi": "days left",
  Terkumpul: "Raised",
  "Dana tercatat": "Recorded funds",
  "Kontrak publik": "Public contract",
  "Periksa jejak donasi": "Check the donation trail",
  "Kontrak publik di BNB Smart Chain Testnet.":
    "Public contract on BNB Smart Chain Testnet.",
  "Donasi sekarang": "Donate now",
  "Setiap donasi masuk ke kontrak pintar dan bisa ditelusuri melalui alamat kontrak publik. Penyaluran dilakukan berdasarkan bukti yang dapat diperiksa.":
    "Every donation enters a smart contract and can be traced through its public address. Distribution follows verifiable evidence.",
  "Buka BscScan": "Open BscScan",
  "Tentang kampanye": "About the campaign",
  "Dana yang sampai, bukan sekadar janji.":
    "Funds that arrive, not just promises.",
  "Profil komunitas": "Community profile",
  "Lihat profil": "View profile",
  "Lihat profil organisasi": "View organization profile",
  Terverifikasi: "Verified",
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Keep the first render identical on the server and browser. The persisted
  // preference is applied after hydration to avoid rendering different copy
  // in SSR and the initial client render.
  const [language, setLanguageState] = React.useState<Language>("id")

  React.useEffect(() => {
    const saved = window.localStorage.getItem("mizan-language")
    if (saved === "id" || saved === "en") {
      setLanguageState(saved)
    }
    document.documentElement.lang = language
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem("mizan-language", language)
  }, [language])

  const value = React.useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: Language) => {
        setLanguageState(nextLanguage)
        window.localStorage.setItem("mizan-language", nextLanguage)
        document.cookie = `mizan-language=${nextLanguage}; path=/; max-age=31536000; samesite=lax`
      },
      isEnglish: language === "en",
      t: (text: string) => translateText(text, language),
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const translateText = (text: string, language: Language): string =>
  language === "en" ? (ENGLISH[text] ?? text) : text

export function useLanguage() {
  const context = React.useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }

  return context
}
