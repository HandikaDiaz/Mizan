export const TESTNET_NOTICE =
    "Data demo di BNB Smart Chain Testnet — dana tidak nyata."

export const SITE = {
    name: "Mizan",
    tagline: "Zakat & donasi on-chain yang bisa diaudit",
    network: "BNB Smart Chain Testnet",
    chainId: 97,
    explorer: "https://testnet.bscscan.com",
    contract: "0x7A3f9C2B41dE8b5061aA4f17C93eD28B5a0E9b21",
    contractShort: "0x7A3f…9b21",
} as const

export const NAV = [
    { label: "Zakat", href: "#zakat" },
    { label: "Kampanye", href: "#kampanye" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Transparansi", href: "#cara-kerja" },
    { label: "Tanya Jawab", href: "#tanya-jawab" },
] as const

export const PROOFS = [
    {
        value: "97",
        unit: "chain ID",
        label: "Jaringan uji",
        detail: "BNB Smart Chain Testnet, bukan mainnet.",
    },
    {
        value: "1.482",
        unit: "tx",
        label: "Transaksi tercatat",
        detail: "Setiap donasi dan penyaluran membuat jejak permanen.",
    },
    {
        value: "3/3",
        unit: "milestone",
        label: "Pencairan bertahap",
        detail: "Dana keluar hanya setelah bukti penyaluran diverifikasi.",
    },
] as const

export const CATEGORIES = [
    {
        icon: "Scale",
        name: "Zakat",
        asnaf: "8 asnaf",
        desc: "Ditakar sesuai nisab dan disalurkan ke golongan yang berhak.",
    },
    {
        icon: "HeartHandshake",
        name: "Donasi Umum",
        asnaf: "Bebas",
        desc: "Untuk kebutuhan mendesak yang tidak masuk ketentuan zakat.",
    },
    {
        icon: "Landmark",
        name: "Wakaf",
        asnaf: "Aset tetap",
        desc: "Pokoknya dijaga, manfaatnya mengalir jangka panjang.",
    },
    {
        icon: "Siren",
        name: "Tanggap Bencana",
        asnaf: "Mendesak",
        desc: "Pencairan dipercepat dengan verifikasi dua tahap.",
    },
] as const

export type Campaign = {
    id: string
    kategori: string
    judul: string
    penyelenggara: string
    lokasi: string
    terkumpul: number
    target: number
    satuan: "BNB" | "USDT"
    donatur: number
    sisaHari: number
    terverifikasi: boolean
    ringkas: string
    gambar: string
    komunitas: {
        id?: string
        nama: string
        tipe: string
        bio: string
        inisial: string
    }
}

export const FEATURED: Campaign = {
    id: "kmp-0142",
    kategori: "Zakat",
    judul: "Bantuan pendidikan untuk 40 anak yatim di Lombok Timur",
    penyelenggara: "Yayasan Nurul Iman",
    lokasi: "Lombok Timur, NTB",
    terkumpul: 12.4,
    target: 20,
    satuan: "BNB",
    donatur: 87,
    sisaHari: 12,
    terverifikasi: true,
    ringkas:
        "Biaya sekolah, seragam, dan perlengkapan belajar selama satu tahun ajaran untuk 40 anak. Dana dicairkan tiga kali, mengikuti bukti penerimaan dari sekolah.",
    gambar: "/background-hero.png",
    komunitas: {
        nama: "Yayasan Nurul Iman",
        tipe: "Yayasan terverifikasi",
        bio: "Komunitas pendidikan yang mendampingi anak yatim dan keluarga rentan di Lombok Timur.",
        inisial: "NI",
    },
}

export const CAMPAIGNS: Campaign[] = [
    {
        id: "kmp-0138",
        kategori: "Donasi Umum",
        judul: "Air bersih untuk 120 kepala keluarga di Sumba Timur",
        penyelenggara: "Komunitas Air Sumba",
        lokasi: "Sumba Timur, NTT",
        terkumpul: 8.75,
        target: 15,
        satuan: "BNB",
        donatur: 143,
        sisaHari: 19,
        terverifikasi: true,
        ringkas:
            "Sumur bor dan penampungan air untuk tiga dusun yang selama ini menempuh 4 km untuk mengambil air.",
        gambar: "/background-hero.png",
        komunitas: {
            nama: "Komunitas Air Sumba",
            tipe: "Komunitas lokal terverifikasi",
            bio: "Relawan lokal yang memperjuangkan akses air bersih untuk keluarga di Sumba Timur.",
            inisial: "AS",
        },
    },
    {
        id: "kmp-0131",
        kategori: "Zakat",
        judul: "Modal usaha untuk 25 ibu tunggal di Bantul",
        penyelenggara: "Amanah Mikro",
        lokasi: "Bantul, DIY",
        terkumpul: 4200,
        target: 6000,
        satuan: "USDT",
        donatur: 62,
        sisaHari: 24,
        terverifikasi: true,
        ringkas:
            "Zakat produktif berupa modal dan pendampingan usaha selama enam bulan, disalurkan bertahap per kelompok.",
        gambar: "/background-hero.png",
        komunitas: {
            nama: "Amanah Mikro Community",
            tipe: "Data community terverifikasi",
            bio: "Komunitas pendamping usaha mikro yang membantu ibu tunggal membangun penghasilan yang berkelanjutan.",
            inisial: "AM",
        },
    },
    {
        id: "kmp-0127",
        kategori: "Tanggap Bencana",
        judul: "Logistik tiga posko pengungsian di Cianjur",
        penyelenggara: "Relawan Siaga Nusantara",
        lokasi: "Cianjur, Jabar",
        terkumpul: 16.2,
        target: 18,
        satuan: "BNB",
        donatur: 211,
        sisaHari: 4,
        terverifikasi: true,
        ringkas:
            "Tenda, air bersih, dan dapur umum untuk tiga posko. Pencairan mengikuti kuitansi harian dari koordinator lapangan.",
        gambar: "/background-hero.png",
        komunitas: {
            nama: "Relawan Siaga Nusantara",
            tipe: "Relawan terverifikasi",
            bio: "Jaringan relawan yang menyalurkan bantuan darurat secara langsung ke posko pengungsian.",
            inisial: "RS",
        },
    },
]

export const ALL_CAMPAIGNS = [FEATURED, ...CAMPAIGNS]

export function getCampaignById(id: string) {
    return ALL_CAMPAIGNS.find((campaign) => campaign.id === id)
}

export const STEPS = [
    {
        n: "01",
        title: "Hubungkan dompet",
        body: "Cukup dompet yang mendukung BNB Smart Chain. Tidak ada pendaftaran, tidak ada unggah KTP.",
        note: "Tidak ada data pribadi yang disimpan.",
    },
    {
        n: "02",
        title: "Donasi masuk ke kontrak",
        body: "Dana tidak masuk ke rekening kami. Dana masuk ke kontrak pintar yang alamatnya bisa kamu periksa sendiri di BscScan.",
        note: "Dana tidak bisa dipindahkan sepihak oleh pengelola.",
    },
    {
        n: "03",
        title: "Cair setelah bukti terverifikasi",
        body: "Penyelenggara mengunggah bukti penyaluran. Setelah diverifikasi, dana cair ke dompet penerima — bukan ke dompet pengelola.",
        note: "Sisa dana yang tidak tersalur dikembalikan ke donatur.",
    },
] as const

export const FUND_FLOW = [
    {
        role: "Donatur",
        address: "0x4d2A…8f10",
        action: "Mengirim 0,5 BNB",
        hash: "0x9c41e7b2…4a6d",
        block: "41.882.307",
    },
    {
        role: "Kontrak Mizan",
        address: "0x7A3f…9b21",
        action: "Menahan dana + mencatat niat",
        hash: "0x2f80a1c9…7be3",
        block: "41.882.311",
    },
    {
        role: "Penerima",
        address: "0xB15c…2e77",
        action: "Menerima 0,48 BNB (setelah biaya jaringan)",
        hash: "0x6de3b880…91fc",
        block: "41.907.442",
    },
] as const

export const STATS = [
    { label: "Donasi tercatat", value: "1.482", unit: "transaksi" },
    { label: "Dana terkumpul", value: "37,35", unit: "BNB" },
    { label: "Dana tersalur", value: "31,10", unit: "BNB" },
    { label: "Kampanye aktif", value: "4", unit: "kampanye" },
] as const

export const STATS_FOOTNOTE =
    "Angka dari BNB Smart Chain Testnet. Dana tersalur lebih kecil dari dana terkumpul karena pencairan mengikuti milestone yang sudah diverifikasi."

export const STORY = {
    quote:
        "Sekarang saya bisa lihat sendiri uangnya sampai ke mana. Dulu saya cuma bisa percaya pada kata-kata.",
    name: "Siti Rahmawati",
    role: "Koordinator lapangan, Lombok Timur",
    context:
        "Menerima penyaluran tahap kedua pada 14 Agustus. Bukti penyaluran dan transaksi pencairannya terbuka untuk diperiksa siapa pun.",
    numbers: [
        { label: "Penyaluran tahap", value: "2 dari 3" },
        { label: "Diterima", value: "3,96 BNB" },
        { label: "Penerima manfaat", value: "40 anak" },
    ],
    hash: "0x6de3b880…91fc",
} as const

export const FAQ = [
    {
        q: "Apa yang membuat ini beda dari platform donasi biasa?",
        a: "Di platform biasa, kamu menyerahkan dana lalu tidak bisa melihat lagi ke mana perginya. Di sini dana masuk ke kontrak pintar yang alamatnya publik, dan setiap pencairan ke penerima tercatat sebagai transaksi yang bisa kamu periksa sendiri kapan saja.",
    },
    {
        q: "Apakah pengelola bisa membawa kabur dananya?",
        a: "Tidak sepihak. Dana ditahan kontrak, bukan ditahan orang. Pencairan hanya bisa terjadi bila syarat milestone terpenuhi, dan alasannya tercatat di blockchain. Kalau kampanye gagal mencapai target, dana dikembalikan ke donatur.",
    },
    {
        q: "Bagaimana kalau laporan penyalurannya palsu?",
        a: "Setiap laporan wajib disertai bukti yang bisa ditelusuri — kuitansi, foto berlokasi, atau tanda terima penerima. Bukti yang tidak lolos verifikasi membuat pencairan tertahan, bukan otomatis cair. Verifikasi otomatis akan ditangani agen AI pada tahap berikutnya; untuk sekarang prosesnya masih manual dan setiap keputusan dicatat.",
    },
    {
        q: "Apakah saya harus paham kripto untuk ikut?",
        a: "Tidak perlu paham. Kamu perlu satu dompet yang mendukung BNB Smart Chain, dan hanya itu. Istilah seperti biaya jaringan akan ditampilkan dalam bentuk angka yang jelas sebelum kamu menekan tombol konfirmasi.",
    },
    {
        q: "Apakah ini sudah dipakai untuk dana sungguhan?",
        a: "Belum. Seluruh data di halaman ini berjalan di BNB Smart Chain Testnet — jaringan uji yang dananya tidak punya nilai. Kami tidak akan mengumpulkan dana nyata sebelum kontraknya selesai diaudit pihak ketiga.",
    },
    {
        q: "Berapa biaya yang dipotong?",
        a: "Hanya biaya jaringan dari blockchain, yang langsung dibayarkan ke jaringan — bukan ke kami. Tidak ada potongan pengelola pada versi ini, dan kalau nanti ada, besarnya harus tertulis di kontrak sehingga tidak bisa diubah diam-diam.",
    },
] as const

export function presentase(terkumpul: number, target: number) {
    return Math.min(100, Math.round((terkumpul / target) * 100))
}

export const MILESTONE_TOTAL = 3

export function milestoneSelesai(terkumpul: number, target: number) {
    const pct = (terkumpul / target) * 100
    return Math.max(
        0,
        Math.min(MILESTONE_TOTAL, Math.round((pct / 100) * MILESTONE_TOTAL)),
    )
}

export function formatAngka(n: number) {
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(n)
}
