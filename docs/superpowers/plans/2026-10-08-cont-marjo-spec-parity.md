# CONT MARJO Spec Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete and align the simulated tax, signature/SRI, purchasing, marketplace, accountant, and superadmin flows across the independent web and Expo mobile apps.

**Architecture:** Keep web and mobile repositories separate and implement equivalent typed domain rules in each. Add pure helpers for deadlines, document-state transitions, and admin statistics; connect those helpers to the existing web context and mobile app state. Keep credentials transient and all external operations visibly simulated.

**Tech Stack:** Web: React, TypeScript, Vite, Tailwind, pnpm, Vitest. Mobile: React Native, Expo Router, TypeScript, pnpm, Vitest.

## Estado y alcance implementado (8 oct 2026)

Este plan ya se ejecutó en las dos ramas locales `feat/align-web-mobile-with-spec`. El certificado se configura en Perfil una sola vez; cada emisión simula XML, firma automática, envío pendiente de aprobación SRI y posterior aprobación/envío. El usuario puede configurar en Perfil una cuenta SRI de demostración; la contraseña solo se usa para completar el formulario y se borra, sin guardarse ni enviarse. Quedaron alineados RUC/OCR, bóveda, calendario, OCR con conciliación a gastos/cuentas por pagar/inventario, marketplace por rol, mensajes/permisos, evidencia de contador y panel estadístico de Superadmin.

El panel Superadmin se añadió por petición del usuario; no es un requisito del spec original. Todas las operaciones externas y los datos de demostración siguen siendo simulados. La sincronización real, el OCR real, la firma criptográfica, el acceso con credenciales reales y el almacenamiento persistente requieren backend y servicios que este prototipo no tiene. En móvil se muestra un identificador de acceso ficticio, no una clave SRI/RIDE válida.

Validación realizada: web `pnpm lint`, `pnpm test` (5 pruebas) y `pnpm build`; móvil `pnpm lint`, `pnpm test` (9 pruebas) y `pnpm build:web`. Las pruebas visuales automatizadas no pudieron abrir localhost desde el navegador integrado aislado, por lo que falta ese recorrido visual manual.

## Global Constraints

- “There is NO backend available for this prototype. All features, document parsers, SRI integrations, signatures, and state changes MUST be simulated using a reactive client-side mock store.”
- Keep every SRI, OCR, digital signature, and external persistence action explicitly labeled as a local demonstration.
- Configure certificate and SRI account from Profile; never ask for certificate password on every invoice and never retain an entered password.
- Preserve `CONTRIBUYENTE`, `CONTADOR_PROFESIONAL`, and `SUPER_ADMIN` role-specific views.
- Use pnpm in both projects. Do not create a shared runtime package or monorepo.
- Never store actual SRI credentials or certificate bytes in the mock state.

---

## File map

Web state/contracts live in `web/src/context/AppContext.tsx` and `web/src/types/index.ts`; role screens live in `web/src/components/modules/`. Add pure logic in `web/src/domain/` and Vitest tests beside it. Mobile state/contracts live in `mobile/src/state/AppState.tsx` and `mobile/src/state/types.ts`; screens live in `mobile/src/screens/`. Add matching pure logic in `mobile/src/state/` with Vitest tests. Keep the expected behavior in this plan and the design spec in both repositories.

### Task 1: Testable functional contract and validation setup

**Files:** `web/package.json`, `web/pnpm-lock.yaml`, `web/src/domain/parity.test.ts`, `mobile/src/state/parity.test.ts`, copied design/plan docs in mobile.

- [x] Add Vitest scripts/dependency to web using pnpm and confirm an empty focused test run works.
- [x] Add equivalent tests in each repository for due-date mapping (RUC digit 9 => 26), invoice transition labels, automatic setup gating, and KPI aggregation from provided mock records.
- [x] Implement the helpers against the tests; final focused suites pass in both apps.

### Task 2: Onboarding, profile, signature setup, and SRI account

**Files:** `web/src/types/index.ts`, `web/src/context/AppContext.tsx`, `web/src/components/modules/OnboardingRucModule.tsx`, `web/src/components/modules/ProfileModule.tsx`, `web/src/components/modules/AccessModule.tsx`; `mobile/src/state/types.ts`, `mobile/src/state/AppState.tsx`, `mobile/src/screens/AuthScreen.tsx`, `mobile/src/screens/ProfileScreen.tsx`, `mobile/src/screens/ContributorScreens.tsx`.

- [x] Extend the profile models with RUC activities, establishment, obligations, certificate expiry and SRI-account state; passwords are transient.
- [x] RUC OCR demo fills the seed data and allows review/edit/confirmation.
- [x] Profile certificate setup accepts `.pfx`/`.p12`, records demo expiry/status and clears the password.
- [x] Profile SRI setup records username/configured state only and clears the password after the explicit demo action.
- [x] Home/profile notices point to missing setup; issuance is blocked until certificate and SRI demo setup are complete.
- [x] Both lint and test commands pass after implementation.

### Task 3: Automatic signature and SRI emission lifecycle

**Files:** `web/src/types/index.ts`, `web/src/context/AppContext.tsx`, `web/src/components/modules/InvoicingModule.tsx`, `web/src/components/modules/DocumentHistoryModule.tsx`, `web/src/components/common/RideViewerModal.tsx`, `web/src/components/common/DocumentSignModal.tsx`; `mobile/src/state/types.ts`, `mobile/src/state/AppState.tsx`, `mobile/src/screens/ContributorScreens.tsx`.

- [x] Add matching tests for lifecycle labels and profile setup gating.
- [x] Require certificate and SRI setup and explain the missing Profile section before sending.
- [x] Remove per-invoice password prompts; signing is automatic in the emission demo.
- [x] Insert as `PENDIENTE_SRI`, then transition reactively to `APROBADO_ENVIADO`.
- [x] Web shows the ordered simulated XML/sign/send/approval stepper; mobile explains the automatic signature and two visible states.
- [~] Web provides demo access key/RIDE; mobile shows a clearly labeled fictitious access identifier and amounts/status, not a full RIDE or valid SRI key.
- [x] Web/mobile lint, tests and production web builds pass.

### Task 4: Tax calendar and preventive alerts

**Files:** `web/src/domain/taxCalendar.ts`, `web/src/domain/parity.test.ts`, `web/src/context/AppContext.tsx`, `web/src/components/modules/TaxCalendarModule.tsx`; `mobile/src/state/taxCalendar.ts`, `mobile/src/state/parity.test.ts`, `mobile/src/state/AppState.tsx`, `mobile/src/screens/ContributorScreens.tsx`.

- [x] Implement matching pure helpers for the official ninth-digit base schedule and upcoming dates.
- [~] Derive demo due dates from the profile/RUC; invalid RUC no longer falls back to digit 9. Web still presents a fixed October 2026 demo grid, and mobile has an obligation list rather than a full month grid.
- [~] Both apps provide an obligation view and simulated alert/disclaimer; a full dynamic agenda and direct official-calendar link remain to add.
- [x] Domain tests and app lint/builds pass.

### Task 5: Purchase OCR decisions and inventory sync

**Files:** `web/src/components/modules/PurchaseOcrModule.tsx`, `web/src/context/AppContext.tsx`, `web/src/components/modules/InventoryModule.tsx`; `mobile/src/state/types.ts`, `mobile/src/state/AppState.tsx`, `mobile/src/screens/ContributorScreens.tsx`.

- [x] Keep parsed OCR decisions and effects in typed local app state.
- [x] Both apps show a sample supplier/totals and let the user choose expense, payable, and inventory effects.
- [~] Reconciliation guards against repeat application and updates the selected views; mobile uses a seeded inventory item rather than a catalog-matched line-item ledger.
- [x] Type checks pass; duplicate reconciliation is guarded by purchase ID.

### Task 6: Marketplace, shared chat, access consent, and accountant evidence

**Files:** `web/src/context/AppContext.tsx`, `web/src/components/modules/MarketplaceModule.tsx`, `web/src/components/modules/ClientWorkspaceModule.tsx`; `mobile/src/state/types.ts`, `mobile/src/state/AppState.tsx`, `mobile/src/screens/AccountantScreens.tsx`, `mobile/src/screens/ContributorScreens.tsx`.

- [x] Separate contributor requests/received offers from accountant opportunities/sent offers.
- [x] Add matching conversation/consent controls for invoices, SRI/tax data and bank statements, labeled local demo state.
- [x] Preserve accountant evidence upload, obligation, period, note and per-client receipt records in both apps.
- [x] Type, unit and production build checks pass for role screens.

### Task 7: Superadmin statistics dashboard

**Files:** `web/src/domain/adminStats.ts`, `web/src/domain/parity.test.ts`, `web/src/components/modules/SuperAdminModule.tsx`, `web/src/context/AppContext.tsx`; `mobile/src/state/adminStats.ts`, `mobile/src/state/parity.test.ts`, `mobile/src/screens/AdminScreens.tsx`, `mobile/src/state/AppState.tsx`.

- [x] Test aggregation for role, document states, offers, OCR, vault and service counts.
- [x] Show labeled demo counts and avoid claiming real service uptime; vault percent is derived from used/limit.
- [x] Implement web and compact mobile dashboards with matching KPI definitions.
- [x] KPI tests, lint and builds pass.

### Task 8: Cross-platform verification and documentation

**Files:** both app READMEs and this plan.

- [x] Run `pnpm lint`, `pnpm test` and production web builds in both repositories.
- [~] A localhost visual walkthrough was attempted, but the isolated in-app browser timed out connecting to both local servers; visual/manual review remains.
- [x] No credential values or uploaded binary contents are stored in app state; builds and dependencies remain ignored.
- [x] Record demo limits: no real OCR, cryptographic signature, SRI authentication/synchronization or persistence.
