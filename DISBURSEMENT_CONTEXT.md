# Mizan Disbursement — Final Implementation Context

Tanggal verifikasi: **2026-10-07**  
Network target: **BSC Testnet, chain ID 97**  
Branch kerja: **`feat/disburs`**

Dokumen ini mencatat kondisi implementasi M1–M6 yang benar-benar sudah
diverifikasi. Tidak ada private key atau secret yang dicatat di sini.

## Lifecycle dan invariant

```text
SUBMITTED
  → AI_VERIFIED / REJECTED / MANUAL_REVIEW
  → ADMIN_APPROVED
  → CHAIN_PENDING
  → DISBURSED / CHAIN_FAILED
```

- Satu milestone hanya dapat mempunyai satu request aktif.
- Request aktif mencakup `SUBMITTED`, `AI_VERIFIED`, `MANUAL_REVIEW`,
  `ADMIN_APPROVED`, `CHAIN_PENDING`, dan `CHAIN_FAILED`.
- Request baru hanya dapat dibuat setelah request sebelumnya `REJECTED`.
- Request, total item, milestone, dan release on-chain memakai nominal exact.
- Total milestone harus sama persis dengan target campaign.
- Receipt yang belum diketahui tetap `CHAIN_PENDING`; kegagalan definitif menjadi
  `CHAIN_FAILED` dan retry memakai request serta release key yang sama.
- Database hanya mencatat `DISBURSED` setelah event `FundsReleased` tervalidasi.

## Status M1–M6

### M1 — Selesai

Lifecycle, amount rules, refund policy, custody signer, deployment inventory,
dan runbook saldo legacy `0.01 tBNB` ditetapkan di
[`DISBURSEMENT.md`](./DISBURSEMENT.md). Tidak ada transaksi legacy yang
dijalankan.

### M2 — Selesai

`MizanFundingVault` v4 mengimplementasikan escrow, target cap, deadline,
pull-based refund, fixed milestones, role manager/verifier/disburser/pauser,
reservation, idempotent release, pause/unpause, dan validasi saldo tersedia.
Cancellation setelah reserve tetap dapat direfund tanpa underflow pada view
saldo. Validasi terakhir: **21 contract tests passing**, compile dan type-check
package contract lulus.

### M3 — Kode selesai; deployment testnet terblokir konfigurasi signer

- ABI v4 berisi 77 entri dan cocok dengan artifact terbaru.
- Deployment script memvalidasi chain ID dan seluruh role setelah deployment.
- Smoke script v4 menjalankan register → fund → submit → verify → release serta
  memvalidasi role, event, recipient, amount, release key, dan escrow summary.
- Deployment belum dijalankan karena parameter deployment dan signer
  verifier/disburser/funder belum aktif lengkap. Address aplikasi saat ini masih
  menunjuk deployment historis, sehingga tidak boleh dipakai sebagai v4.

Deployment dan smoke test baru boleh dijalankan setelah custody signer M1
dipenuhi dan variabel server-side tersedia. Jangan menaruh private key pada
`NEXT_PUBLIC_*`, database, atau dokumentasi.

### M4 — Selesai

- Schema memuat metadata contract/deadline, evidence hash, receipt metadata,
  lifecycle baru, unique milestone order, idempotency key, dan
  `activeRequestKey` untuk satu request aktif.
- State machine dan amount invariants memiliki unit test.
- **27 operasi** schema sudah diterapkan ke database lokal.
- `prisma db verify` lulus dan dry-run sesudah apply menghasilkan **0 operasi**.
- Generated migration yang berasal dari graph lama dan tidak aman tidak dipakai;
  snapshot contract yang aktif memakai hash
  `74814cb8f1f9b3929b8da90877ae2be2c42743c02c6c63c1faca2cd2b2adbf49`.

### M5 — Selesai dari sisi kode dan validasi lokal

- Typed viem client memakai ABI v4 dan signer berbasis role di server saja.
- Campaign registration memvalidasi address, chain, version, state, receipt,
  dan event sebelum database direkonsiliasi.
- Payment confirmation memvalidasi `FundsCommitted`, contract, campaign,
  wallet, amount, cap, transaction hash, dan idempotency.
- Approval mengirim evidence dan verification transaction; release memvalidasi
  event lengkap sebelum `DISBURSED`.
- Timeout/receipt unknown tetap pending, sedangkan retry mempertahankan
  idempotency key yang sama.

### M6 — Selesai dari sisi UI dan validasi lokal

- Beneficiary form mengunci nominal ke raw milestone wei.
- Admin actions tersedia sesuai status: approve/reject/release/check/retry.
- Status chain, error, transaction explorer, dan funded/reserved/released/
  available ditampilkan.
- Menu beneficiary sekarang membuka halaman milestone, proof, dan disbursement
  yang nyata; stub “fitur belum tersedia” sudah dihapus.
- Client payment melakukan polling confirmation dengan payload idempotent ketika
  receipt masih pending.

## Validasi terakhir

- Root TypeScript: lulus.
- Vitest: **23 files, 69 tests passing**.
- Contract: **21 tests passing**, compile dan type-check lulus.
- Production build: lulus; route dashboard/disbursement terdeteksi oleh Next.js.
- ESLint untuk seluruh file yang berubah: 0 error, 2 warning lama pada helper
  admin campaign.
- ESLint global masih gagal pada file lama/generated di luar scope M1–M6; file
  tersebut tidak diubah agar diff tetap terbatas.
- Database contract verify: lulus, tanpa schema drift.

## Satu blocker operasional tersisa

M1–M6 sudah terintegrasi pada codebase dan database lokal, tetapi flow belum
dapat disebut 100% terverifikasi di BSC Testnet sampai tersedia:

1. `contracts/ignition/params.bscTestnet.json` dengan role holder sesuai custody;
2. signer verifier dan disburser (boleh satu signer testnet sesuai M1), serta
   funder smoke-test;
3. `MIZAN_VERIFIER_PRIVATE_KEY` dan `MIZAN_DISBURSER_PRIVATE_KEY` pada server;
4. deployment address v4 pada `MIZAN_CONTRACT_ADDRESS` dan
   `NEXT_PUBLIC_MIZAN_CONTRACT_ADDRESS`;
5. satu eksekusi `npm run deploy:testnet` dan `npm run smoke:testnet` yang lulus.

Tidak ada workaround aman untuk mengarang signer atau menganggap deployment
historis sebagai v4.

## Sumber kebenaran

| Area | File |
| --- | --- |
| M1 decisions | `DISBURSEMENT.md` |
| Contract | `contracts/src/MizanFundingVault.sol` |
| Contract tests | `contracts/test/MizanFundingVault.ts` |
| ABI | `src/lib/chain/abi/MizanFundingVault.v4.json` |
| Schema | `src/prisma/contract.prisma` |
| Workflow | `src/lib/disbursement-workflow.ts` |
| Chain integration | `src/lib/chain/` dan `src/lib/disbursement-chain.ts` |
| Beneficiary API | `app/api/beneficiary/disbursements/route.ts` |
| Admin actions | `app/(dashboard)/(admin)/admin/penyaluran/actions.ts` |
