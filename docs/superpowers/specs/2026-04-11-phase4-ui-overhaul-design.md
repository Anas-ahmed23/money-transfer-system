# Phase 4 — UI Overhaul Design Spec
**Date:** 2026-04-11  
**Status:** Approved by client

---

## Overview

Phase 4 is a UI/UX overhaul of the live Money Transfer System. No schema changes. No breaking changes to existing transfer, accounts, or statements functionality. All work is additive or targeted replacement.

---

## Requirements (Client-Confirmed)

1. Convert whole app to light theme
2. All numbers in English numerals (not Arabic/Eastern Arabic)
3. Create Account accessible from the accounts page (same flow context)
4. Search in the transfer page account selector
5. Improved UI — polished, professional design
6. Same-currency-only transfer enforcement (exchange rate deferred to Phase 5)
7. Shared navbar on all pages
8. Search + filtering in accounts page
9. No pagination issues / broken list behavior

---

## Architecture Decisions

### A. Light Theme
- Change CSS variables in `globals.css` `:root` block only
- No `dark:` class variants added — single theme app
- Hardcoded dark inline `style={}` blocks across pages/components cleaned up in Phase 4D
- Brand gold accent retained: `hsl(44 54% 45%)` (deepened slightly for light contrast)

**New palette:**
- `--background`: `210 20% 98%` (near-white)
- `--foreground`: `222 47% 11%` (deep slate)
- `--card`: `0 0% 100%` (white)
- `--card-foreground`: `222 47% 11%`
- `--primary`: `44 54% 45%` (gold, contrast-adjusted)
- `--primary-foreground`: `222 47% 11%`
- `--secondary`: `220 14% 96%`
- `--secondary-foreground`: `222 47% 11%`
- `--muted`: `220 14% 96%`
- `--muted-foreground`: `215 16% 47%`
- `--border`: `220 13% 91%`
- `--input`: `220 13% 91%`
- `--ring`: `44 54% 45%`

### B. English Numerals
**Root cause:** `formatCurrency` in `lib/utils.ts` uses `Intl.NumberFormat('ar-SA', ...)`.

**Fixes (3 targeted edits):**
1. `lib/utils.ts` → locale `'ar-SA'` → `'en-US'`, keep currency style
2. `AccountTransactionsTable.tsx` → `formatDate` locale `'ar-SA'` → `'en-US'`
3. `backend/src/services/transfer.service.ts` → error message `toLocaleString('ar-SA')` → `toLocaleString('en-US')`

### C. Create Account Flow
**Interpretation 1 selected:** Add a "Create Account" button on the `/accounts` page header linking to existing `/accounts/create`. Zero changes to create page logic. After submission, existing redirect to `/accounts` completes the loop.

### D. Search in Transfer
Add a text search input above the `AccountSelect` component in `TransferForm`. Filtered account list is computed with `useMemo` filtering on `holderName` and `accountNumber`. Filtered list passed to existing `AccountSelect` component. No changes to submit logic or API calls.

### E. UI Polish
- Consistent `max-w-5xl` container across all pages (transfer was `max-w-4xl`)
- Card, table, and button spacing improvements
- Light-theme-compatible inline style cleanup
- Navbar replaces copy-pasted header blocks

### F. Same-Currency Enforcement
**Frontend:** When `fromAccount` is selected, auto-set `currency` to match `fromAccount.currency` and disable the currency `<Select>`. When `toAccount` is selected, validate `toAccount.currency === fromAccount.currency`. If mismatch, show inline error on the `toAccount` field.

**Backend:** In `TransferService.createTransfer`, add guard: if `fromAccount.currency !== currency` throw 400 `CURRENCY_MISMATCH`. If `toAccount.currency !== currency` throw 400 `CURRENCY_MISMATCH`.

No schema changes required.

### G. Shared Navbar
- New file: `frontend/src/components/layout/Navbar.tsx`
- Rendered once in `frontend/src/app/layout.tsx` (inside `<body>`, above `{children}`)
- All 5 per-page `<header>` blocks removed
- Navbar content: brand logo, nav links (الرئيسية / الحسابات / تحويل), status indicator
- Active link detection via `usePathname` — Navbar is a client component

### H. Search + Filtering in Accounts
- New client component: `frontend/src/components/accounts/AccountsListSection.tsx`
- Accepts `accounts: Account[]` prop from server component
- Internal state: `searchQuery` (string), `currencyFilter` (Currency | 'ALL')
- Filtered accounts via `useMemo`
- Search matches: `holderName` (case-insensitive) OR `accountNumber` (case-insensitive)
- Currency filter: dropdown with ALL + each currency present in the list
- Renders `AccountsTable` with filtered result
- Accounts page server component passes accounts to this wrapper instead of directly to table

### I. List Stability
- No pagination added (MVP scope, all records fetched)
- Ordering: accounts `orderBy: { holderName: 'asc' }`, transactions `orderBy: { createdAt: 'desc' }`
- Both tables have empty state rendering (already exist, will be styled for light theme)
- Safeguard: `take: 500` added to `findMany` queries as a soft cap

---

## Sub-Phases

| Phase | Contents |
|---|---|
| 4A | globals.css light theme + English numerals + Navbar + layout + header removal + Create Account button |
| 4B | Same-currency enforcement (frontend + backend) + Transfer search |
| 4C | AccountsListSection with search + filter |
| 4D | Inline style cleanup pass (light theme polish across all components) |

---

## Files Modified / Created

| File | Action |
|---|---|
| `frontend/src/app/globals.css` | Update CSS variables |
| `frontend/src/lib/utils.ts` | Fix formatCurrency locale |
| `frontend/src/components/accounts/AccountTransactionsTable.tsx` | Fix formatDate locale |
| `backend/src/services/transfer.service.ts` | Fix error locale + currency validation |
| `frontend/src/components/layout/Navbar.tsx` | **Create** |
| `frontend/src/app/layout.tsx` | Add Navbar |
| `frontend/src/app/page.tsx` | Remove header, light style cleanup |
| `frontend/src/app/accounts/page.tsx` | Remove header, add Create button, use AccountsListSection |
| `frontend/src/app/accounts/create/page.tsx` | Remove header, light style cleanup |
| `frontend/src/app/accounts/[id]/page.tsx` | Remove header, light style cleanup |
| `frontend/src/app/transfer/page.tsx` | Remove header, light style cleanup |
| `frontend/src/components/transfer/TransferForm.tsx` | Currency auto-detect + search |
| `frontend/src/components/accounts/AccountsListSection.tsx` | **Create** |
| `frontend/src/components/accounts/AccountsTable.tsx` | Light style cleanup |
| `frontend/src/components/accounts/AccountSummaryCard.tsx` | Light style cleanup |
| `frontend/src/components/transfer/SummaryCard.tsx` | Light style cleanup |

---

## Constraints

- No schema migrations
- No breaking changes to transfer, accounts, or statements
- No automatic push
- Exchange-rate support deferred to Phase 5
