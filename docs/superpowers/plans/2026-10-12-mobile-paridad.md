# Mobile parity implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Expo mobile application to functional parity with the existing web areas for contributor, accountant, manager, and superadmin, using native mobile navigation and touch layouts.

**Architecture:** Keep Expo Router and the existing AppState. Add a typed role-aware module catalog, a compact tab bar for frequent destinations, and a grouped “Más” catalog for secondary modules. Reuse current mobile business flows, then add native screens for missing finance, verification, jobs, notification, and admin capabilities.

**Tech Stack:** Expo SDK 57, Expo Router 57, React Native 0.86, TypeScript 6, lucide-react-native.

## Global Constraints

- Keep all changes in the mobile repository and follow `mobile/AGENTS.md`.
- Treat the approved web UI, content, and demo identities as the source of truth; keep external integrations clearly marked as simulated.
- Do not add dependencies unless an existing Expo-compatible API cannot meet the need.
- Match the approved web palette and component hierarchy while adapting controls to touch-friendly native layouts.

---

### Task 1: Role catalog and mobile navigation

**Files:** `src/state/types.ts`, `src/state/navigation.ts`, `src/state/navigation.test.ts`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/more.tsx`, `src/app/(tabs)/module.tsx`, `src/state/AppState.tsx`, `src/screens/AuthScreen.tsx`

- [ ] Add manager to the role model and allow manager/admin demo access.
- [ ] Define every web module as a role-aware catalog entry grouped by business area.
- [ ] Keep four frequent tabs plus “Más” and route remaining modules via the shared module screen.
- [ ] Add role labels, active module heading, and grouped mobile module chooser.

### Task 2: Contributor workflows

**Files:** `src/screens/ContributorScreens.tsx`, new `src/screens/ContributorBusinessScreens.tsx`, `src/app/(tabs)/module.tsx`, `src/state/AppState.tsx`, `src/state/types.ts`

- [ ] Complete mobile destinations for invoicing, purchases/OCR, inventory, business overview, tax calendar, signature/vault, services marketplace, work, notifications, onboarding, and profile.
- [ ] Preserve emission blockers, purchase reconciliation, client permissions, file pickers, and demo-state messages.
- [ ] Reuse existing document, workspace, marketplace and profile screens instead of duplicating their business logic.

### Task 3: Accountant and manager workflows

**Files:** `src/screens/AccountantScreens.tsx`, new `src/screens/VerificationScreens.tsx`, `src/screens/WorkScreens.tsx`, `src/screens/NotificationScreen.tsx`, `src/state/AppState.tsx`, `src/state/types.ts`, `src/state/navigation.ts`

- [ ] Add accountant verification, professional overview, proposals, client workspace permissions, and work tracking.
- [ ] Add manager overview, application queue/details, and interview availability/appointments.
- [ ] Keep evidence uploads native and preserve role access boundaries.

### Task 4: Superadmin workflows

**Files:** `src/screens/AdminScreens.tsx`, `src/state/adminStats.ts`, `src/state/navigation.ts`, module catalog and routing files

- [ ] Add platform overview metrics and admin sections for marketplace, taxpayers, accountants, and activity.
- [ ] Retain service/integration status and explicitly simulated demo content.

### Task 5: Design pass and verification

**Files:** shared mobile primitives, role navigation, affected screen files

- [ ] Refine spacing, safe areas, touch target sizing, empty/error states, and long-content scrolling.
- [ ] Run `pnpm lint`, `pnpm test`, and `pnpm build:web` from `mobile/`.
- [ ] Inspect changed screens at narrow phone widths and review the final diff for role/module coverage.
