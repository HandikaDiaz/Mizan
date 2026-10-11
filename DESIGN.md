# DESIGN.md — Mizan

> **Zakat & donasi lintas batas yang bisa diaudit siapa saja.**
> Dokumen ini adalah sumber kebenaran tunggal untuk semua keputusan visual.
> Setiap nilai di sini **sudah diverifikasi secara matematis** (rasio kontras WCAG dihitung, bukan diklaim).
> Aturan anti-slop diterapkan **selama** proses pengerjaan, bukan sebagai audit di akhir.

|                      |                                                                                   |
| -------------------- | --------------------------------------------------------------------------------- |
| **Produk**           | Mizan — platform zakat & donasi berbasis kripto                                   |
| **Jaringan**         | BNB Smart Chain **Testnet** (BNB & USDT testnet)                                  |
| **Stack**            | Next.js 16.2.6 · React 19.2.4 · Tailwind CSS v4 · shadcn/ui _base-nova_ (Base UI) |
| **Referensi visual** | ayobantu.com — diambil DNA-nya, diperbaiki kelemahannya                           |
| **Bahasa antarmuka** | Bahasa Indonesia                                                                  |
| **Status**           | Landing page (Fase 1)                                                             |

> ⚠️ **Semua angka, saldo, alamat dompet, dan hash transaksi di landing page ini adalah data TESTNET.**
> Harus selalu diberi label jelas. Dilarang menampilkan angka palsu seolah-olah dana nyata.

---

## 1. Arah Desain

**"Warung amanah yang punya receipt."**

Ini bukan fintech dingin, bukan pula lembaga birokratis. Ini platform zakat yang **hangat dan manusiawi seperti penggalangan dana kampung**, tapi **setiap rupiahnya punya jejak yang bisa dibuktikan matematis**.

Kehangatan datang dari palet purple-violet dengan coral dan warm yellow sebagai aksen. Kredibilitas datang dari **monospace, angka tabular, dan struktur yang rapi seperti ledger** — bukan dari badge "terverifikasi" yang cuma tulisan.

Kuncinya: **estetika kami adalah argumen produk.** Mono dan ledger dipakai karena uangnya memang bisa dilacak, bukan sebagai hiasan.

---

## 2. Yang Diambil dari ayobantu.com & Yang Diperbaiki

Saya bedah ayobantu.com secara langsung: header, hero, kategori, kartu kampanye, band statistik purple, footer. Token aslinya:

```
Font      : Poppins (satu keluarga untuk semuanya) · body 14px
Container : 1240px
Brand     : #702082  (primary purple — CTA, band statistik + footer)
Aksen     : #F57961  (coral — secondary accent) + #F5C557 (highlight/status)
Radius    : 4px / 15px / 26px  ← tidak konsisten
```

**Yang dipertahankan** (memang bagus):

- ✅ Primary purple `#702082` — tegas, khas, dan menjadi anchor visual Mizan
- ✅ Coral + warm yellow sebagai aksen sekunder dan status, bukan pengganti primary
- ✅ Lebar container 1240px — sudah pas
- ✅ Latar dominan putih, dengan band primary purple sebagai "tanda baca" visual
- ✅ Kartu kampanye dengan bilah progres — pola yang benar untuk donasi

**Yang diperbaiki** — inilah "modif yang kurang"-nya:

| #   | Masalah di ayobantu                                                                                                                      | Perbaikan di Mizan                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **5 warna tombol tanpa alasan** — biru `#007BFF`, hijau `#28A745`, kuning, merah, abu. Warisan bawaan Bootstrap, bukan keputusan desain. | **Satu sistem:** 1 _primary_ (primary purple), coral untuk aksen sekunder, warm yellow untuk status/highlight, sisanya _outline_/_ghost_. Warna = makna, bukan dekorasi. |
| 2   | **Semua Poppins, body 14px.** Tidak ada hierarki — judul dan caption terasa satu suara.                                                  | **Dua keluarga dengan peran jelas:** Plus Jakarta Sans (teks) + JetBrains Mono (data). 9 tingkat skala tipografi.                                                        |
| 3   | **Netral abu mati** — `#212529`, `#6C757D`, `#E9ECEF`. Abu murni bikin seluruh halaman terasa kotor dan tidak disengaja.                 | Netral ungu gelap `#25212A` dan muted `#68636C` menyatu dengan identitas purple.                                                                                         |
| 4   | **Radius acak** — 4px, 15px, 26px dalam satu layar, tanpa pola.                                                                          | **Sistem radius berbasis peran.** Satu peran = satu radius.                                                                                                              |
| 5   | **Hero carousel berputar otomatis.** Gerakan yang tidak diminta pengguna.                                                                | **Hero statis, satu pesan.** Visual: _Neraca Mizan_ (lihat §12).                                                                                                         |
| 6   | **Statistik dengan animasi hitung-naik.** Pameran, bukan informasi.                                                                      | Angka **statis dan tegas**, dengan keterangan jaringan dan sumber yang bisa diverifikasi.                                                                                |
| 7   | **Strip 36 logo partner.** Klaim sosial tanpa bukti.                                                                                     | Diganti **blok verifikasi on-chain** — tautan nyata ke BscScan. Bukti, bukan klaim.                                                                                      |
| 8   | **Semua kartu sama besar.** Tidak ada hierarki — mata tidak tahu harus ke mana.                                                          | **1 kampanye unggulan besar + kartu sekunder.** Hierarki lewat ukuran, bukan urutan.                                                                                     |
| 9   | **Dua set ikon campur** — FontAwesome + IcoFont, ketebalan garis beda.                                                                   | **Satu set:** lucide-react, `stroke-width: 1.5` konsisten.                                                                                                               |
| 10  | **Kontras tidak terjaga** — teks `#A5A5A5` di putih hanya 2.5:1.                                                                         | Semua pasangan warna **dihitung** dan didokumentasikan (§5). Ambang minimum 4.5:1.                                                                                       |

---

## 3. Prinsip

1. **Estetika harus jadi argumen.** Kalau sebuah pilihan visual tidak bisa dijelaskan alasannya dalam satu kalimat, buang.
2. **Uang butuh angka yang jujur.** Mono, tabular, rata kanan untuk nominal. Tanpa animasi pameran.
3. **Kehangatan ≠ kekanak-kanakan.** Tanpa emoji sebagai ikon, tanpa ilustrasi maskot, tanpa kata "yuk!" bertaburan.
4. **Purple adalah merek Kami.** Coral, warm yellow, dan gradient violet-magenta hanya membawa makna sekunder.
5. **Kosong itu mahal.** Ruang kosong menandakan keyakinan. Halaman penuh = halaman yang tidak tahu harus menonjolkan apa.
6. **Aksesibilitas bukan tambahan.** Kontras dihitung, fokus terlihat, gerakan dihormati.

---

## 4. Palet Warna

Palette ini adalah sumber kebenaran visual. Gunakan token CSS di `app/globals.css`; jangan menulis hex mentah di component.

| Role              | Token utama                          | Hex       | Pakai untuk                                          |
| ----------------- | ------------------------------------ | --------- | ---------------------------------------------------- |
| Primary Purple    | `--primary-purple` / `--brand-700`   | `#702082` | Logo, primary CTA, heading accent, statistik, footer |
| Brand Violet      | `--brand-violet` / `--brand-500`     | `#8E3FA3` | Card, ilustrasi, secondary UI                        |
| Bright Purple     | `--bright-purple` / `--brand-400`    | `#A83BB5` | Gradient/highlight                                   |
| Magenta           | `--magenta`                          | `#C347B9` | Gradient endpoint / dekoratif                        |
| Soft Lavender     | `--soft-lavender` / `--brand-100`    | `#EEE3F1` | Background card, surface sunken                      |
| Very Light Purple | `--very-light-purple` / `--brand-50` | `#F8F3F9` | Section background, page canvas                      |
| Coral / Orange    | `--coral`                            | `#F57961` | Secondary accent, verification/status accent         |
| Warm Yellow       | `--warm-yellow` / `--accent-200`     | `#F5C557` | Small highlights, testnet/status/illustration        |
| Dark Text         | `--ink`                              | `#25212A` | Main typography                                      |
| Muted Text        | `--ink-muted`                        | `#68636C` | Description, metadata                                |
| Surface           | `--surface`                          | `#FFFFFF` | Main background, card                                |

### 4.1 Aturan pemakaian

- CTA utama selalu `Primary Purple` dengan teks putih. Coral bukan pengganti primary.
- Gradient dekoratif hanya memakai `Brand Violet → Bright Purple → Magenta`; tidak untuk teks panjang atau status penting.
- Warm Yellow dipakai sebagai highlight/status dengan teks gelap; jangan gunakan teks putih di atasnya.
- Semua teks utama memakai Dark Text dan deskripsi memakai Muted Text. Pastikan fokus keyboard tetap terlihat.
- Class lama `brand-*` dan `accent-*` dipertahankan sebagai alias token agar component dashboard tetap konsisten.

---

## 5. Tipografi

**Dua keluarga. Setiap peran satu alasan.**

### Plus Jakarta Sans — teks

Dibuat Tokotype untuk identitas kota Jakarta. Lisensi SIL OFL 1.1.
_Alasan memilih:_ huruf Indonesia untuk produk Indonesia. Bentuknya humanis dan ramah, dengan terminal yang tegas saat ditebalkan — hangat tanpa jadi kekanak-kanakan.

### JetBrains Mono — data

Lisensi SIL OFL 1.1.
_Alasan memilih:_ angka tabularnya presisi sempurna dan `0` vs `O`/`l` vs `1` tidak ambigu.
**Ini bukan font "keren-kerenan kripto".** Dipakai karena alamat dompet dan nominal harus bisa dibaca ulang karakter per karakter tanpa salah baca — persis alasan teknisnya.

### Skala (fluid, `clamp()`)

| Token            | Ukuran                                    | Line-height | Weight | Letter-spacing | Pakai                                                        |
| ---------------- | ----------------------------------------- | ----------- | ------ | -------------- | ------------------------------------------------------------ |
| `--text-display` | `clamp(2.5rem, 1.4rem + 4.4vw, 4rem)`     | 1.05        | 800    | −0.03em        | Hero                                                         |
| `--text-h1`      | `clamp(2rem, 1.3rem + 2.8vw, 2.75rem)`    | 1.1         | 800    | −0.025em       | Judul section                                                |
| `--text-h2`      | `clamp(1.5rem, 1.2rem + 1.3vw, 1.875rem)` | 1.2         | 700    | −0.02em        | Sub-section                                                  |
| `--text-h3`      | `1.25rem`                                 | 1.3         | 600    | −0.01em        | Judul kartu                                                  |
| `--text-body-lg` | `1.125rem`                                | 1.6         | 400    | 0              | Paragraf pengantar                                           |
| `--text-body`    | `1rem`                                    | 1.6         | 400    | 0              | Isi                                                          |
| `--text-sm`      | `0.875rem`                                | 1.55        | 400    | 0              | Keterangan                                                   |
| `--text-label`   | `0.8125rem`                               | 1.4         | 600    | +0.02em        | Label, badge (HURUF BESAR)                                   |
| `--text-mono`    | `0.875rem`                                | 1.5         | 500    | 0              | Alamat, hash, nominal (`font-variant-numeric: tabular-nums`) |

**Aturan:**

- Maksimal **2 bobot berbeda** per layar (mis. 400 + 700).
- `--text-display` hanya **sekali** per halaman.
- Panjang baris isi: **60–75 karakter** (`max-width: 68ch`).
- Semua nominal uang: **mono + tabular-nums + rata kanan**.
- Alamat dompet: mono, dipotong di tengah — `0x7a3f…9b21`, dengan tombol salin.

---

## 6. Tata Letak & Jarak

- **Skala jarak:** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128` px. Tidak ada nilai di luar ini.
- **Container:** `max-width: 1240px` (dipertahankan dari ayobantu) · padding horizontal `clamp(20px, 5vw, 40px)`.
- **Grid:** 12 kolom, gutter `24px`.
- **Padding vertikal section:** `96px` desktop → `64px` tablet → `48px` mobile.
- **Ritme vertikal:** jarak antar-komponen selalu kelipatan 8px.

### Breakpoint

| Nama | Lebar  | Perubahan utama                         |
| ---- | ------ | --------------------------------------- |
| `sm` | 640px  | Kartu 1→2 kolom                         |
| `md` | 768px  | Navigasi penuh muncul, tab dikembalikan |
| `lg` | 1024px | Tata letak dua kolom aktif              |
| `xl` | 1280px | Container penuh 1240px                  |

---

## 7. Radius, Bayangan, Batas

### Radius — satu peran, satu nilai

| Token           | Nilai    | Peran                        |
| --------------- | -------- | ---------------------------- |
| `--radius-sm`   | `6px`    | Input, tag, chip             |
| `--radius-md`   | `10px`   | Tombol, kartu kecil          |
| `--radius-lg`   | `16px`   | Kartu, panel                 |
| `--radius-xl`   | `24px`   | Permukaan besar, modal, hero |
| `--radius-full` | `9999px` | **Hanya** pil & avatar       |

### Bayangan — ditint hangat, tipis

Bayangan memakai `rgba(23,19,15,…)` (tinta hangat), bukan hitam murni.

```
--shadow-xs: 0 1px 2px  rgba(23,19,15,.06)
--shadow-sm: 0 2px 8px  rgba(23,19,15,.06)
--shadow-md: 0 8px 24px -6px rgba(23,19,15,.10)
--shadow-lg: 0 24px 48px -12px rgba(23,19,15,.16)
```

**Aturan:**

- **Satu** bayangan per elemen. Tidak bertingkat.
- Kartu diam: `--shadow-xs` (bahkan tanpa bayangan, cukup batas).
- Muncul dari interaksi: naik ke `--shadow-md`. Maksimum.
- **Nol glow.** Tanpa `box-shadow: 0 0 40px warna brand`.
- Kartu **tidak** membesar saat _hover_ (`scale` di kartu = slop).

---

## 8. Ikon

- **Satu set:** `lucide-react`. Hapus FontAwesome/IcoFont.
- `stroke-width: 1.5` konsisten. `size: 20px` (dalam teks), `24px` (mandiri), `32px` (penanda section).
- **Dilarang:** emoji sebagai ikon. Ilustrasi maskot. Ikon _gradient_. Ikon di dalam lingkaran berwarna dengan warna acak.
- Ikon **mendampingi** label, tidak menggantikannya (kecuali ikon universal: panah, tutup, salin).

### Ikon aplikasi (favicon)

Lambang neraca putih di atas kotak membulat `--brand-700`, disimpan di `app/`:

| Berkas               | Ukuran                  | Untuk                                      |
| -------------------- | ----------------------- | ------------------------------------------ |
| `app/icon.svg`       | vektor                  | Peramban modern (tajam di semua kerapatan) |
| `app/favicon.ico`    | 16 · 32 · 48 · 64 · 128 | Peramban lama, tab, markah                 |
| `app/apple-icon.png` | 180×180                 | iOS / iPadOS                               |

Ikon harus tetap terbaca pada **16×16 px** — jangan menambahkan detail yang hilang di ukuran itu.
Wajib memakai latar padat; ikon transparan menghilang di tema gelap peramban.

---

## 9. Gerakan

```
--dur-fast: 150ms   --dur-base: 220ms   --dur-slow: 320ms
--ease-out: cubic-bezier(.16, 1, .3, 1)     /* masuk */
--ease-in:  cubic-bezier(.7, 0, .84, 0)     /* keluar */
--ease-io:   cubic-bezier(.65, 0, .35, 1)   /* perpindahan */
```

**Yang diizinkan:**

- Perubahan warna/batas saat _hover_ — 150ms.
- _Ripple_ tombol — 220ms.
- Munculnya panel/dialog — 220ms masuk, 150ms keluar.
- **Satu** gerakan bermakna: **Neraca Mizan** menyeimbang saat masuk viewport (§12.2).
- Transisi bilah progres kampanye saat nilainya berubah.

**Yang dilarang:**

- ❌ `fade-in-up` pada semua section saat _scroll_ (paling khas slop)
- ❌ Animasi angka hitung-naik
- ❌ Carousel berputar otomatis
- ❌ Parallax
- ❌ Kartu membesar saat _hover_
- ❌ Ikon berputar/berdenyut terus-menerus
- ❌ _Marquee_ logo tak berujung

Wajib hormati `@media (prefers-reduced-motion: reduce)` — semua transisi jadi ≤ 0.01ms, Neraca langsung di posisi seimbang.

---

## 10. Komponen

### Tombol

| Varian    | Latar              | Teks          | Batas         | Pakai                   |
| --------- | ------------------ | ------------- | ------------- | ----------------------- |
| `primary` | `--brand-700`      | putih         | —             | Aksi utama halaman      |
| `accent`  | `--primary-purple` | putih         | —             | Aksi donasi / CTA utama |
| `outline` | transparan         | `--brand-700` | `--brand-200` | Aksi sekunder           |
| `ghost`   | transparan         | `--body`      | —             | Aksi tersier            |
| `link`    | —                  | `--brand-700` | —             | Tautan sebaris          |

- Tinggi: `40px` (sm) · `48px` (md) · `56px` (lg)
- Padding-x: `16px` / `20px` / `28px`
- Radius: `--radius-md` — **pil hanya** untuk chip filter
- Fokus: `2px solid --brand-700` + `outline-offset: 2px`
- Gradient hanya untuk ornamen dekoratif `Brand Violet → Bright Purple → Magenta`; tidak untuk teks atau seluruh section.

### Kartu Kampanye (unit berulang inti)

```
┌──────────────────────────────────┐
│ [gambar 16:9]                    │
│ ⬤ Zakat          sisa 12 hari    │  ← badge kategori + tenggat
│ Bantuan Pendidikan 40 Anak       │  ← --text-h3, maks 2 baris
│ Yayasan Nurul Iman · Terverifikasi│  ← penyelenggara
│                                  │
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░  62%          │  ← bilah progres, mono
│ 12.4 BNB / 20 BNB                │  ← mono, tabular
│ dari 87 donatur                  │
└──────────────────────────────────┘
```

- Latar `--surface`, radius `--radius-lg`, batas `--border-soft`
- **Nominal selalu mono + tabular**, satuan (BNB/USDT) berukuran lebih kecil dan `--muted`
- Bilah progres: track `--brand-100`, isi `--brand-700`
- Badge "Terverifikasi": ikon perisai + teks, **bukan** stiker berkilau

### Input

- Tinggi `48px`, radius `--radius-sm`, latar `--surface`
- Batas `--border-ui` (3.04:1 — memenuhi WCAG 1.4.11), **bukan** `--border-soft`
- Fokus: batas `--brand-700` + cincin `2px --brand-100`

### Badge / Chip

- Tinggi `28px`, radius `--radius-full`, teks `--text-label`
- Kategori zakat pakai `--brand-50` + teks `--brand-700`
- Keterangan jaringan ("Testnet") pakai `--accent-200` + teks `--ink`

### Blok Data On-Chain

Kotak mono yang menampilkan alamat kontrak / hash transaksi:

- Latar `--brand-950`, teks `--brand-100`, mono
- Dipotong di tengah + tombol salin
- **Selalu** ada tautan "Lihat di BscScan ↗"
- **Selalu** ada label testnet

---

## 11. Aturan Penulisan

**Nada:** tenang, jujur, spesifik. Seperti petugas lembaga amil yang cakap — bukan pemasar.

- **Boleh:** "Dana cair setelah bukti penyaluran terverifikasi."
- **Dilarang:** "Solusi donasi terbaik & terpercaya nomor 1! 🚀"
- Tanpa emoji di teks antarmuka. Tanpa tanda seru beruntun. Tanpa superlatif tanpa bukti.
- Setiap angka punya **sumber** dan **satuan**: `12.4 BNB` — bukan `12.4`.
- Istilah konsisten: **"kampanye"** (bukan program/campaign), **"penyaluran"**, **"bukti penyaluran"**, **"dompet"**, **"biaya jaringan"** (bukan gas fee), **"verifikasi"**.
- Ajakan bertindak menyebut **hasilnya**, bukan menyuruh: "Lihat alur dana" — bukan "Klik di sini".
- **Selalu** beri label: _"Data testnet — dana tidak nyata."_

---

## 12. Rencana Section Landing Page

### 12.1 Urutan Section

| #   | Section                 | Tujuan                      | Catatan desain                                                                               |
| --- | ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | **Header** (melekat)    | Navigasi + dompet           | Wordmark Mizan · Zakat · Kampanye · Transparansi · Cara Kerja · [Hubungkan Dompet] (outline) |
| 2   | **Hero**                | Menyatakan masalah + solusi | **Asimetris**, bukan tengah. Lihat §12.2                                                     |
| 3   | **Bilah bukti**         | Membangun kredibilitas      | 3 fakta on-chain dengan tautan BscScan. **Bukan** logo klien                                 |
| 4   | **Kategori penyaluran** | Orientasi                   | Zakat (8 asnaf) · Donasi Umum · Wakaf · Tanggap Bencana — ikon + deskripsi satu baris, hemat |
| 5   | **Kampanye unggulan**   | Bukti sosial                | **1 besar + 3 sekunder** lewat ukuran, bukan urutan                                          |
| 6   | **Cara kerja**          | Mengurangi keraguan         | Timeline 3 langkah **vertikal** dengan garis penghubung. Bukan 3 kartu emoji                 |
| 7   | **Alur dana**           | Pembeda inti                | Diagram: Dompet → Kontrak → Penerima, tiap simpul punya contoh hash                          |
| 8   | **Band statistik**      | Skala                       | Latar `--brand-700`. Angka statis + label testnet                                            |
| 9   | **Kisah penerima**      | Emosi                       | **Satu** cerita besar (bukan carousel). Kutipan + foto + tautan penyaluran                   |
| 10  | **Tanya jawab**         | Menjawab keberatan          | **Dua kolom, tanpa akordeon** — semua jawaban terbuka. Akordeon FAQ = pola slop              |
| 11  | **Ajakan penutup**      | Konversi                    | Band `--brand-800`, dua tombol                                                               |
| 12  | **Footer**              | Legal & navigasi            | Latar `--brand-700`. Izin, tautan, sosial, dan **disclaimer testnet**                        |

### 12.2 Hero — Spesifikasi

**Tata letak:** `grid-cols-12` — teks menempati kolom 1–6, visual kolom 7–12. Tidak ke tengah.

**Sisi kiri:**

- Overline: `ZAKAT & DONASI ON-CHAIN` (`--text-label`, mono, `--brand-700`)
- Judul: `--text-display`, maks 2 baris — mis. _"Setiap rupiah punya jejaknya."_
- Paragraf: `--text-body-lg`, maks 68ch
- Dua tombol: `accent` "Donasi Sekarang" + `outline` "Lihat Alur Dana"
- Baris kepercayaan: mono kecil — `BSC Testnet · Kontrak terverifikasi · Tanpa perantara`

**Sisi kanan — "Neraca Mizan":**
Visual tanda tangan halaman. Sebuah **neraca/timbangan** — karena _mizan_ berarti neraca.

- Lengan miring dengan dua panci: **dana masuk** (kiri) dan **dana tersalur** (kanan)
- Angka mono tabular di bawah tiap panci
- Saat masuk viewport, lengan **bergerak sekali** ke posisi seimbang (320ms) dan berhenti
- Alasannya jelas: merepresentasikan fungsi produk — menyeimbangkan amanah
- **Bukan** angka hitung-naik. Gerakannya satu, lalu diam.

### 12.3 Perilaku Mobile

- Header: wordmark + tombol menu + dompet (ikon saja)
- Hero: tumpuk — teks dulu, Neraca di bawah (maks `320px` tinggi)
- Kategori: gulir horizontal dengan _snap_
- Kampanye: 1 kolom penuh
- Tabel frekuensi: pautkan ke tepi kiri & kanan, gulir horizontal bila perlu

---

## 13. Aksesibilitas

- Kontras minimum **4.5:1** teks, **3:1** batas komponen interaktif — sudah dihitung di §4.4
- Kontrol fokus **selalu terlihat**: `2px --brand-700`, `outline-offset: 2px`. Jangan pernah `outline: none`
- Lantai ukuran teks: **16px** untuk isi
- Lantai sasaran sentuh: **44×44px**
- Navigasi keyboard penuh; urutan tab mengikuti urutan visual
- Gambar bermakna punya `alt` deskriptif; dekoratif pakai `alt=""`
- Keadaan isi ditandai lewat **teks**, bukan hanya warna (mis. "Terverifikasi" + ikon + warna)
- `prefers-reduced-motion` dihormati
- Lantai zoom: tetap terbaca pada 200%

---

## 14. Checklist Anti-Slop

Sebelum menandai selesai, semua harus ✅:

- [ ] Gradient hanya violet → bright purple → magenta; tidak ada gradient ungu-ke-biru atau _glassmorphism_
- [ ] Nol `fade-in-up` saat gulir
- [ ] Nol animasi hitung-naik
- [ ] Nol carousel berputar otomatis
- [ ] Nol kartu membesar saat _hover_
- [ ] Nol emoji sebagai ikon
- [ ] Nol "Trusted by" logo palsu
- [ ] Nol teks placeholder — setiap kata bermakna
- [ ] Nol `lorem ipsum`
- [ ] Hero **tidak** ke tengah dengan tombol kembar simetris
- [ ] Radius mengikuti peran, tidak acak
- [ ] Satu sistem warna; warna = makna
- [ ] Satu set ikon, satu ketebalan garis
- [ ] Semua angka tabular & rata kanan
- [ ] Tidak ada kabut dekoratif berlebihan / _blob_ / _noise_
- [ ] Setiap section bisa dijelaskan alasannya dalam satu kalimat

---

## 15. Yang Dilarang Keras

| Dilarang                               | Kenapa                                         |
| -------------------------------------- | ---------------------------------------------- |
| Gradient sebagai latar section         | Slop paling kentara                            |
| `backdrop-filter: blur()` untuk "kaca" | Slop 2023 yang cepat basi                      |
| Radius 24px+ pada kartu standar        | Ikon "desain template"                         |
| Bayangan berwarna & _glow_             | Terlihat seperti _game_ kasual                 |
| Teks abu terang di putih               | Gagal kontras, tidak terbaca                   |
| Putih di atas warm yellow `#F5C557`    | Dilarang — gunakan teks gelap                  |
| Teks di atas gambar tanpa _scrim_      | Gagal kontras, berubah-ubah                    |
| Ikon emoji menggantikan ikon vektor    | Tidak konsisten antar-perangkat                |
| Font ikon campur (FontAwesome + lain)  | Ketebalan garis tidak seragam                  |
| Menyalin logo/merek ayobantu           | Pelanggaran merek — ini hanya referensi visual |

---

## 16. Catatan Teknis

- **Next.js 16.2.6 punya perubahan besar.** Dokumentasi lokal ada di `node_modules/next/dist/docs/`. **Wajib dibaca sebelum menulis kode** — pola Next.js 14/15 tidak bisa diasumsikan berlaku.
- Token Tailwind v4 didefinisikan di `app/globals.css` lewat `@theme`. Token _shadcn_ yang ada sekarang netral semua (kroma 0) dan harus dipetakan ke palet §4.
- shadcn di sini memakai gaya **`base-nova`**, yang berdiri di atas **Base UI** (`@base-ui/react`), **bukan Radix**. API-nya berbeda — jangan asal salin contoh dari dokumentasi Radix.
- `cn()` berasal dari paket **`cn`**, bukan `clsx` + `tailwind-merge`.
- Font dimuat lewat `next/font/google` agar tidak ada pergeseran tata letak. Hanya subhimpunan `latin`.
- Ikon: `lucide-react`. Hapus rujukan FontAwesome/IcoFont.

---

_Dokumen ini hidup. Setiap penyimpangan harus dijelaskan alasannya, lalu diperbarui di sini — bukan dilanggar diam-diam._
