# Changelog MizanFundingVault

## [Production] 2026-10-07 - Sinkronisasi schema disbursement

- Menyinkronkan schema database production dengan contract Prisma `755d6f8743511e30bbb887e84f11432ac9a1cecfee5a416c6485a39b044e01ba`.
- Menormalkan `milestone.order` campaign `1` menjadi `1..9` berdasarkan ID sebelum menerapkan unique constraint.
- Memverifikasi marker dan schema production dengan `prisma db verify` serta status migration `Up to date`.

## [M1] 2026-10-06 - Keputusan lifecycle disbursement

- Menetapkan lifecycle request: `SUBMITTED → AI_VERIFIED/MANUAL_REVIEW/REJECTED → ADMIN_APPROVED → CHAIN_PENDING → DISBURSED/CHAIN_FAILED`.
- Menetapkan satu request aktif per milestone dan nominal request harus sama persis dengan nominal milestone.
- Menetapkan policy refund berbasis deadline dan custody signer terpisah untuk manager, verifier, disburser, dan pauser.
- Mendokumentasikan inventory deployment serta penanganan saldo legacy `0.01 tBNB` di [DISBURSEMENT.md](./DISBURSEMENT.md).

## [M2] 2026-10-06 - Implementasi Escrow v3

### Changed
- **File:** `contracts/src/MizanFundingVault.sol`
- **Deskripsi:** Implementasi escrow milestone pattern dengan dana yang ditahan di contract
- **Klasifikasi:** Type D (Contract Interface)
- **Breaking:** Ya (v2 → v3)

### Detail Perubahan

#### Struktur Data
- **Campaign Struct:** Menambahkan field `reservedAmount` dan `releasedAmount`
- **Milestone Struct:** Struktur baru untuk menyimpan data milestone
- **Release Record:** Mapping `releaseKeyUsed` untuk idempotency

#### Fungsi Baru
- `registerCampaign()` - Sekarang menerima array milestone
- `submitMilestone()` - Submit bukti milestone oleh recipient
- `verifyMilestone()` - Verifikasi milestone oleh VERIFIER_ROLE
- `releaseFunds()` - Release dana oleh DISBURSER_ROLE dengan idempotency key
- `unpause()` - Fungsi untuk unpause contract
- `getCampaignSummary()` - View function untuk escrow balances
- `getMilestone()` - View function untuk milestone details

#### Event Baru
- `FundsCommitted` - Dana ditahan di contract
- `MilestoneSubmitted` - Milestone evidence submitted
- `MilestoneVerified` - Milestone diverifikasi
- `FundsReleased` - Dana dicairkan ke recipient

#### Role Baru
- `VERIFIER_ROLE` - Untuk verify milestone
- `DISBURSER_ROLE` - Untuk release funds

#### Custom Errors
- `InvalidMilestone`, `MilestoneAlreadyExists`, `MilestoneNotFound`
- `MilestoneNotSubmitted`, `MilestoneAlreadyVerified`, `MilestoneAlreadyReleased`
- `InsufficientAvailableFunds`, `ReleaseKeyAlreadyUsed`
- `UnauthorizedBeneficiary`, `MilestoneSumExceedsTarget`

### Security Patterns
- Checks-Effects-Interactions pada `releaseFunds`
- `nonReentrant` guard pada `releaseFunds`
- Idempotency key untuk mencegah double payout
- Role separation (verifier ≠ disburser)

---

## [M2.2] 2026-10-06 - Test Suite Expansion

### Added
- **File:** `contracts/test/MizanFundingVault.ts`
- **Deskripsi:** Test suite lengkap untuk milestone flow

### Test Cases
- ✅ Constructor menolak admin zero address
- ✅ Happy path: register → fund → dana ditahan di contract
- ✅ Hanya CAMPAIGN_MANAGER yang boleh registerCampaign
- ✅ fundCampaign menolak amount nol dan campaign nonaktif
- ✅ Pause memblokir funding
- ✅ RegisterCampaign dengan milestone
- ✅ RegisterCampaign dengan beberapa milestone
- ✅ RegisterCampaign menolak total milestone amount > target
- ✅ fundCampaign menahan dana di contract
- ✅ submitMilestone hanya bisa oleh recipient
- ✅ verifyMilestone hanya bisa oleh verifier
- ✅ releaseFunds hanya bisa oleh disburser
- ✅ releaseFunds menolak jika tidak cukup dana
- ✅ releaseFunds menolak jika amount mismatch
- ✅ releaseFunds menolak jika release key sudah digunakan
- ✅ unpause dapat dipanggil oleh pauser
- ✅ getCampaignSummary mengembalikan nilai yang benar
- ✅ Happy path full flow: register → fund → submit → verify → release

**Total: 18 passing tests**

---

## [M2.3] 2026-10-06 - Ignition Module Update

### Changed
- **File:** `contracts/ignition/modules/MizanFundingVault.ts`
- **Deskripsi:** Update deployment module dengan role VERIFIER dan DISBURSER

### Changed
- **File:** `contracts/ignition/params.bscTestnet.example.json`
- **Deskripsi:** Menambahkan parameter verifier dan disburser

---

## [M3.1] 2026-10-06 - ABI Export v3

### Added
- **File:** `src/lib/chain/abi/MizanFundingVault.v3.json`
- **Deskripsi:** ABI versi 3 dengan 66 entri

### Breaking Changes v2 → v3

| Aspect | v2 | v3 |
|--------|-----|-----|
| fundCampaign | Direct to recipient | Held in contract |
| registerCampaign | 4 params | 5 params (+milestones) |
| Events | FundsTransferred | FundsCommitted, FundsReleased |
| Roles | 3 roles | 5 roles |

---

## [M3.2] 2026-10-06 - Deployment Status

### Status
- **Network:** BSC Testnet (chainId 97) - Pending deployment
- **Contract Version:** v3
- **Roles:** CAMPAIGN_MANAGER_ROLE, VERIFIER_ROLE, DISBURSER_ROLE, PAUSER_ROLE

### Environment Variables
```bash
# Contract Address (to be updated after deployment)
MIZAN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MIZAN_CONTRACT_ADDRESS=0x...

# Private Keys (server-side only)
MIZAN_CAMPAIGN_MANAGER_PRIVATE_KEY=...
MIZAN_VERIFIER_PRIVATE_KEY=...
MIZAN_DISBURSER_PRIVATE_KEY=...
MIZAN_PAUSER_PRIVATE_KEY=...
```

---

## Migration Strategy

1. **Kontrak lama:** Tetap dipertahankan untuk histori
2. **Campaign baru:** Register ke kontrak v3
3. **Campaign lama:** Tetap gunakan kontrak v2 (tidak ada migrasi dana)
4. **Database:** Tambahkan `contractVersion` field

---

## Exit Criteria

### M2 Exit Criteria
- ✅ Semua test cases pass (18/18)
- ✅ Contract compile tanpa error kritis
- ⚠️ Warning: Unused variable (acceptable)

### M3 Exit Criteria
- ✅ ABI v3 tersedia di `src/lib/chain/abi/`
- ⏳ Contract deployed ke BSC Testnet (pending)
- ⏳ Smoke test pass (pending deployment)
- ⏳ Environment variables terupdate (pending deployment)

---

## Files Changed

### Contract
- `contracts/src/MizanFundingVault.sol` - Complete rewrite

### Test
- `contracts/test/MizanFundingVault.ts` - Expanded test suite

### Deployment
- `contracts/ignition/modules/MizanFundingVault.ts` - Updated roles
- `contracts/ignition/params.bscTestnet.example.json` - Added verifier/disburser

### ABI
- `src/lib/chain/abi/MizanFundingVault.v3.json` - New ABI export

### Documentation
- `CHANGELOG.md` - This file

---

## [M2 corrective] 2026-10-06 - Enforcement contract diselaraskan dengan M1

Implementasi awal M2 ditemukan belum memenuhi seluruh keputusan M1. Perubahan yang dilakukan:

- Menambahkan `fundingDeadline` immutable pada campaign.
- Menambahkan target cap: funding di atas target ditolak.
- Menambahkan `claimRefund()` untuk campaign gagal deadline atau dibatalkan sebelum release.
- Mengubah validasi total milestone dari `≤ target` menjadi `= target`.
- Memperbaiki invariant saldo menjadi `funded - released - reserved`.
- Mengurangi `reservedAmount` saat release sehingga beberapa milestone dapat dicairkan sampai saldo escrow habis.
- Mengizinkan campaign manager mencatat evidence hash deterministik agar flow backend dapat memanggil verifikasi chain.
- Menambahkan proteksi release key kosong, cancellation policy, dan mutual exclusion refund/release.
- Memperluas test contract menjadi **20 test passing**.

Karena interface `registerCampaign()` berubah untuk menerima deadline, ABI dikembangkan menjadi **v4**. ABI v3 tidak digunakan untuk deployment baru.

## [M3 corrective] 2026-10-06 - ABI dan deployment validation

- Menambahkan `src/lib/chain/abi/MizanFundingVault.v4.json` dengan 77 entri ABI.
- Memperbaiki validasi parameter deployment agar memeriksa `verifier` dan `disburser`, bukan hanya `campaignManager` dan `pauser`.
- Memperbaiki verifikasi pascadeployment agar seluruh role operasional diperiksa.
- Status deployment BSC Testnet masih pending karena signer operasional v4 belum tersedia di environment aplikasi.

## [M4 in progress] 2026-10-06 - Schema dan workflow disbursement

Sudah dikerjakan:

- Menambahkan metadata contract campaign/payment dan `fundingDeadline` pada contract schema.
- Menambahkan `evidenceHash` serta unique `(campaignId, order)` dan `contractMilestoneId` pada milestone.
- Menambahkan status request `MANUAL_REVIEW`, `ADMIN_APPROVED`, `CHAIN_PENDING`, dan `CHAIN_FAILED`.
- Menambahkan `idempotencyKey`, `activeRequestKey`, `approvedAmountWei`, metadata receipt, error chain, dan retry counter pada request.
- Menambahkan state machine dan helper validasi amount/item di `src/lib/disbursement-workflow.ts`, `src/lib/disbursement-validation.ts`, dan `src/lib/disbursement-requests.ts`.
- Menambahkan unit test state transition dan amount invariants.
- `prisma contract emit` berhasil dan `prisma db update --dry-run` menghasilkan 26 operasi schema yang dapat diaudit.

Belum selesai pada catatan ini: integrasi `viem` backend, refactor action admin, UI M6, migration apply, deployment testnet, dan full E2E.

## [Execution context] 2026-10-06 - Status lanjutan M1–M6

Context lengkap untuk melanjutkan pekerjaan dipisahkan ke
[`DISBURSEMENT_CONTEXT.md`](./DISBURSEMENT_CONTEXT.md).

Catatan penting:

- Implementasi M4 dan sebagian M5/M6 sudah berada di working tree, tetapi
  belum boleh dianggap sebagai flow disbursement 100% selesai.
- Deployment contract v4, signer operasional, update database lokal, smoke test
  testnet, dan full E2E masih pending.
- `app/api/payments/confirm/route.ts` masih menggunakan parser payment legacy;
  migrasi ke event ABI v4 harus dilakukan sebelum on-chain payment dinyatakan
  konsisten dengan vault v4.
- Tidak ada private key atau secret yang dicatat di changelog/context.

## [M4–M6 final] 2026-10-07 - Integrasi disbursement v4

Catatan status 2026-10-06 di atas telah digantikan oleh implementasi dan
verifikasi berikut:

- Menerapkan 27 operasi schema M4 ke database lokal, lalu memverifikasi marker,
  contract schema, dan dry-run tanpa drift.
- Menyelesaikan lifecycle request, exact amount/item validation,
  transaction-safe active request key, reject/resubmit, dan retry dengan
  idempotency key tetap.
- Menyelesaikan typed viem integration untuk registration, evidence,
  verification, release, receipt reconciliation, dan validasi event v4.
- Memigrasikan payment confirmation ke `FundsCommitted` v4, menambahkan unique
  transaction hash, race-safe idempotency, dan polling receipt di client.
- Menambahkan validasi deployment metadata agar status database `REGISTERED`
  tidak dipercaya jika address, chain, version, atau state contract berbeda.
- Mengganti action beneficiary yang masih mock dengan halaman milestone, proof,
  dan disbursement yang sudah ada.
- Menampilkan funded, reserved, released, available, status, error, dan explorer
  transaction pada UI disbursement.
- Memperbarui smoke test agar menjalankan flow v4 lengkap dan memvalidasi role,
  event, recipient, amount, release key, serta escrow summary.
- Memperbaiki saldo tersedia setelah cancellation/refund pada milestone yang
  telah direservasi; contract suite sekarang **21 tests passing**.

Validasi final lokal:

- TypeScript root lulus.
- Vitest **69/69** lulus.
- Contract test **21/21**, compile, dan type-check lulus.
- Production build Next.js lulus.
- ESLint seluruh file yang berubah: 0 error.
- Prisma database verify lulus dan dry-run menghasilkan 0 operasi.

Deployment dan smoke test BSC Testnet belum dijalankan karena parameter
deployment serta signer verifier/disburser/funder belum tersedia lengkap.
Address yang saat ini ada di environment adalah deployment historis dan tidak
dianggap sebagai v4. Detail status terakhir ada di
[`DISBURSEMENT_CONTEXT.md`](./DISBURSEMENT_CONTEXT.md).
