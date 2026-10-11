# SDD ledger — plan: docs/superpowers/plans/2026-09-29-dashboard-bilingual-plan.md

Setup: inline native execution in the shared workspace; existing user changes are preserved.
Pre-flight: Task 1 produces the translation keys and translateText contract consumed by Tasks 2–6; current provider already exposes translateText, and later tasks will extend that interface without changing its signature.
Pre-flight: Tasks 2–5 share dashboard component props and useLanguage; no database or server-action interface changes are planned.
Task 1 complete: extended the existing id/en provider with dashboard translation keys and exported translateText coverage; focused language tests pass.
Task 2 complete: shared dashboard shell, stat cards, route loading labels, payment history, and admin milestone actions now consume the language provider; TypeScript passes.
Task 3 implementation pass: beneficiary overview, profile, campaign list/create, grid, disbursement request, milestone/disbursement headings, and proof page headings now use localized UI copy while database values remain unchanged.
Task 4 implementation pass: benefactor overview and campaign payment/history shared UI use localized labels, actions, status messages, and locale-aware dates.
Task 5 implementation pass: admin overview, campaign list/create/edit, and disbursement page headings/actions use localized UI copy.
Verification checkpoint: 19 Vitest files passed (60 tests); TypeScript passed. Full ESLint remains blocked by pre-existing generated/legacy errors outside this change, and repository-wide Prettier reports pre-existing formatting drift.
Final self-review: no database/server-action contract changes were introduced; UI translation is opt-in through the shared provider, unknown strings safely fall back to Indonesian, and database/user-entered content is rendered directly. `git diff --check` is clean. Git commit was not created because the workspace Git index is permission-locked (`.git/index.lock`).
Post-implementation bug fix: LanguageProvider now hydrates with a deterministic Indonesian initial render and applies localStorage after mount; StatCard is explicitly client-rendered before using useLanguage; landing-page language control moved from SiteHeader into the bottom SitePreferences portal. Full Vitest passes in single-worker mode (19 files, 60 tests) and TypeScript passes.
