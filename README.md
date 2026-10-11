# Mizan

Mizan adalah platform zakat dan donasi berbasis blockchain yang membantu pengguna menemukan campaign, berdonasi, dan memeriksa jejak penggunaan dana secara transparan.

Setiap campaign memiliki milestone. Bukti penggunaan dana disimpan pada milestone dan histori penyaluran publik ditampilkan setelah milestone berstatus `DISBURSED` serta memiliki `proofImageUrl`.

> **Catatan:** aplikasi ini menggunakan BNB Smart Chain Testnet. Saldo, alamat wallet, dan transaction hash yang tampil di aplikasi bukan dana nyata.

## Fitur utama

- Landing page campaign dan transparansi penyaluran dana.
- Dashboard Admin, Donatur, dan Penerima Manfaat.
- Campaign dengan target dana, milestone, bukti penggunaan dana, dan proses pencairan.
- Histori penggunaan dana berbasis milestone yang sudah disalurkan.
- Pembayaran simulasi database dan pembayaran on-chain melalui BSC Testnet.
- Integrasi Privy untuk autentikasi dan wallet Ethereum.
- Integrasi Supabase untuk autentikasi/storage dan PostgreSQL melalui Prisma.
- Verifikasi dokumen/bukti dengan Langflow.
- Dukungan antarmuka Bahasa Indonesia dan Bahasa Inggris. Data campaign dan data yang berasal dari database tetap ditampilkan dalam bahasa aslinya.

## Teknologi

- Next.js `16.2.6` dan React `19.2.4`
- TypeScript
- Tailwind CSS v4 dan Base UI/shadcn
- Prisma Next dan PostgreSQL
- Supabase
- Privy
- BNB Smart Chain Testnet
- Vitest

## Struktur direktori

```text
app/                  Route dan halaman Next.js
  (dashboard)/        Dashboard Admin, Donatur, dan Penerima Manfaat
  campaigns/          Halaman publik campaign
  organizations/      Halaman publik organisasi
  onboarding/         Alur onboarding pengguna/organisasi
  api/                 API routes
components/           Komponen UI dan dashboard
src/lib/              Logic server, validasi, payment, blockchain, dan storage
src/prisma/            Prisma contract dan database client
migrations/            Migration dan snapshot Prisma
contracts/             Smart contract dan konfigurasi deployment
public/                Asset publik
docs/                  Dokumentasi spesifikasi dan rencana perubahan
```

Keputusan desain dan inventory deployment untuk alur pencairan tersedia di
[`DISBURSEMENT.md`](DISBURSEMENT.md).

## Persyaratan

- Node.js 20 atau lebih baru
- npm
- PostgreSQL 15 atau lebih baru
- Akun Supabase
- Privy App ID/Client ID untuk login dan wallet
- RPC BNB Smart Chain Testnet jika fitur on-chain digunakan

Integrasi Gemini, OpenRouter, dan Langflow diperlukan hanya untuk fitur AI/verifikasi terkait. Fitur dasar UI tetap dapat dikembangkan tanpa mengaktifkan semua integrasi tersebut.

## Konfigurasi environment

Buat file `.env.local` di root project. Jangan commit file ini dan jangan membagikan private key atau service role key.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
PRIVY_APP_SECRET=
PRIVY_JWKS_URL=

# PostgreSQL / Prisma
DATABASE_URL=
DIRECT_URL=

# AI (opsional sesuai fitur yang digunakan)
GEMINI_API_KEY=
OPENROUTER_API_KEY=

# Langflow (opsional untuk verifikasi dokumen)
LANGFLOW_API_KEY=
LANGFLOW_BASE_URL=
LANGFLOW_MILESTONE_VERIFICATION_FLOW_ID=
LANGFLOW_DISBURSEMENT_FLOW_ID=
LANGFLOW_DISBURSEMENT_FILE_COMPONENT_ID=
LANGFLOW_PDF_FILE_COMPONENT_ID=

# BNB Smart Chain Testnet
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
NEXT_PUBLIC_MIZAN_CONTRACT_ADDRESS=
MIZAN_CONTRACT_ADDRESS=
MIZAN_CONTRACT_VERSION=v4
MIZAN_DEMO_CAMPAIGN_ID=
BSCSCAN_API_KEY=

# Signer aplikasi; server-side only.
MIZAN_CAMPAIGN_MANAGER_PRIVATE_KEY=
MIZAN_VERIFIER_PRIVATE_KEY=
MIZAN_DISBURSER_PRIVATE_KEY=

# Signer package contracts; server-side only.
DEPLOYER_PRIVATE_KEY=
CAMPAIGN_MANAGER_PRIVATE_KEY=
VERIFIER_PRIVATE_KEY=
DISBURSER_PRIVATE_KEY=
FUNDER_PRIVATE_KEY=
```

`NEXT_PUBLIC_*` dapat digunakan oleh browser. Semua key lain harus diperlakukan sebagai secret dan hanya digunakan di server.

## Instalasi

Clone repository lalu install dependency:

```bash
git clone <repository-url>
cd mizan
npm install
```

Buat `.env.local`, isi variabel environment yang diperlukan, lalu pastikan database PostgreSQL dapat diakses oleh `DATABASE_URL`.

Untuk memeriksa contract database Prisma:

```bash
npm run contract:verify
npm run contract:status
```

## Menjalankan project

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Pada Windows PowerShell, perintahnya sama:

```powershell
npm run dev
```

## Script yang tersedia

```bash
npm run dev          # Menjalankan Next.js dalam mode development
npm run build        # Membuat production build
npm run start        # Menjalankan production build
npm run typecheck    # Memeriksa TypeScript
npm run lint         # Menjalankan ESLint
npm run contract:plan    # Melihat rencana perubahan database contract
npm run contract:status  # Memeriksa status contract/migration
npm run contract:verify  # Memverifikasi koneksi dan contract database
npm run contract:emit    # Menghasilkan output contract Prisma
```

Test dijalankan dengan Vitest:

```bash
npx vitest run
```

Jika environment Windows memiliki keterbatasan worker/process, gunakan single-worker:

```bash
npx vitest run --pool=threads --maxWorkers=1 --minWorkers=1
```

## Alur penggunaan singkat

1. Pengguna login melalui Privy.
2. Penerima Manfaat membuat campaign dan milestone.
3. Admin meninjau campaign serta bukti penyaluran.
4. Donatur membayar melalui simulasi database atau BSC Testnet.
5. Penerima Manfaat mengunggah bukti penggunaan dana.
6. Setelah milestone berstatus `DISBURSED`, histori penyaluran dapat ditampilkan secara publik.

## Catatan keamanan

- Jangan commit `.env.local`.
- Jangan menaruh private key, `SUPABASE_SERVICE_ROLE_KEY`, `PRIVY_APP_SECRET`, atau API key server ke dalam kode client.
- Gunakan hanya wallet dan dana testnet untuk pengembangan lokal.
- Validasi input dilakukan di server; perubahan data sensitif tidak boleh hanya mengandalkan validasi client.

## Lisensi

Lisensi project mengikuti kebijakan repository ini.
