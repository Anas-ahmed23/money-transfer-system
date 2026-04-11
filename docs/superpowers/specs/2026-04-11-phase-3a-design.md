# Phase 3A Design Spec

> Approved by client on 2026-04-11. No schema changes. No new packages. Vercel/Neon safe.

## Scope

Phase 3A delivers five targeted changes to the existing Next.js frontend. Zero schema changes, zero new dependencies.

---

## Workstream 1 — Home Page

**Route:** `/` (currently redirects to `/transfer`)

Replace the 5-line redirect in `app/page.tsx` with a proper navigation hub.

**Visual requirements:**
- Matches the dark gold theme of all existing pages (same header, same footer, same background)
- Arabic RTL
- Mobile-friendly
- Title: "نظام التحويلات"
- Subtitle: "إدارة الحسابات والتحويلات ومتابعة الحركة المالية بسهولة"

**Navigation cards (3):**
1. إجراء تحويل → `/transfer`
2. عرض الحسابات → `/accounts`
3. إنشاء حساب جديد → `/accounts/create`

**Constraints:**
- Do NOT modify `app/layout.tsx`
- No global nav changes
- The existing `/transfer`, `/accounts`, `/accounts/[id]` pages are unchanged

---

## Workstream 2 — Account Creation Screen

**Route:** `/accounts/create` (new page, does not currently exist)

**API:** `POST /api/accounts` (new handler, added to existing route file)

### Form fields

| Label (Arabic) | Field name | Type | Validation |
|---|---|---|---|
| اسم الحامل | `holderName` | text | required |
| رقم الحساب | `accountNumber` | text | required |
| الرصيد الافتتاحي | `balance` | number | >= 0, required |
| العملة | `currency` | select | SAR/USD/EUR/GBP/AED, required |

**Behavior:**
- Submit → `POST /api/accounts`
- Success → redirect to `/accounts`
- Error → display Arabic error message inline
- Loading state during submission

### API contract

`POST /api/accounts`

Request body:
```json
{ "holderName": "...", "accountNumber": "...", "balance": 1000, "currency": "SAR" }
```

Success response (201):
```json
{ "success": true, "data": { "id": "...", "accountNumber": "...", "holderName": "...", "balance": 1000, "currency": "SAR", "createdAt": "..." } }
```

Error response (400/422/500):
```json
{ "success": false, "error": { "message": "رسالة الخطأ" } }
```

Duplicate accountNumber error:
```json
{ "success": false, "error": { "message": "رقم الحساب مستخدم بالفعل" } }
```

---

## Workstream 3 — Transaction Direction Color Fixes

**File:** `components/accounts/AccountTransactionsTable.tsx`

**Current problem:** The `amount` column is `text-foreground` (white) regardless of direction. The total amount is always gold.

**Required fix:**
- `amount` column: red (`#f87171`) for outgoing, green (`#4ade80`) for incoming
- Add directional prefix: `−` for outgoing, `+` for incoming
- `totalAmount` column: also red/green per direction (remove always-gold override)
- Direction badge already styled correctly — no change needed there

---

## Workstream 4 — Accounts Table Readability Fixes

**File:** `components/accounts/AccountsTable.tsx`

**Current problem:** `accountNumber` and `currency` text use `text-muted-foreground` which is too weak against the dark background.

**Required fix:**
- `holderName`: already `text-foreground` (white) — no change needed
- `accountNumber`: change from `text-muted-foreground` to `rgba(255,255,255,0.75)` inline style
- Currency code (e.g. "SAR"): change from `text-muted-foreground` to `rgba(255,255,255,0.75)`
- Currency label (e.g. "ريال سعودي"): change from `text-muted-foreground` to `rgba(255,255,255,0.6)`

---

## Files Changed in Phase 3A

| File | Action |
|---|---|
| `frontend/src/app/page.tsx` | Modified — replace redirect with home page |
| `frontend/src/app/api/accounts/route.ts` | Modified — add POST handler |
| `frontend/src/app/accounts/create/page.tsx` | Created — account creation form |
| `frontend/src/components/accounts/AccountTransactionsTable.tsx` | Modified — direction colors on amounts |
| `frontend/src/components/accounts/AccountsTable.tsx` | Modified — readability contrast fixes |

**Not touched:**
- `app/transfer/page.tsx`
- `app/accounts/page.tsx`
- `app/accounts/[id]/page.tsx`
- `app/api/transfer/route.ts`
- `app/api/transfer/[id]/route.ts`
- `app/api/accounts/[id]/route.ts`
- `app/api/accounts/[id]/transactions/route.ts`
- `app/layout.tsx`
- `prisma/schema.prisma`
- All components under `components/transfer/`
- All UI primitives under `components/ui/`
