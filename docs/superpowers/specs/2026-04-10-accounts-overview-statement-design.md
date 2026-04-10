# Design Spec: Accounts Overview + Account Statement

**Date:** 2026-04-10
**Phase:** Post-MVP Extension
**Status:** Approved

---

## 1. Goal

Add two new screens to the live Money Transfer MVP:

1. **Accounts Overview** (`/accounts`) — list all accounts with balances
2. **Account Statement** (`/accounts/[id]`) — full transaction history for one account

These screens are read-only. They expose data already stored in the database. No new database tables, no schema changes, no deposit/funding logic.

---

## 2. Constraints

- Zero changes to any existing working file
- No Prisma schema changes — no migrations, no `db push`
- No shared layout/header refactor (per-page headers, same as `/transfer`)
- New pages use direct Prisma in async server components (Approach A — same pattern as `/transfer/page.tsx`)
- New API routes are created for completeness but pages do NOT call them internally
- All Arabic text must be correct RTL-safe
- Must not break: transfer creation, balance updates, existing API routes, Vercel/Neon compatibility

---

## 3. Existing Codebase Summary

### Live API Routes (do not touch)
| Route | Method | Purpose |
|---|---|---|
| `/api/accounts` | GET | List all accounts |
| `/api/transfer` | POST | Create a transfer |
| `/api/transfer/[id]` | GET | Get transfer by ID |

### Existing Types (do not change)
- `Account`, `Transfer`, `Currency`, `TransferStatus`, `ApiResponse<T>`, `ApiErrorResponse`
- `CURRENCY_LABELS`, `COMMISSION_RATE`

### Existing Pages (do not touch)
- `/` → redirects to `/transfer`
- `/transfer` — transfer form, server component, direct Prisma

### Prisma Schema (do not change)
- `Account`: id, accountNumber, holderName, balance, currency, createdAt
- `Transfer`: id, fromAccountId, toAccountId, amount, currency, commission, totalAmount, status, createdAt
- Relations: `Transfer.fromAccount` → Account, `Transfer.toAccount` → Account

---

## 4. New API Routes

### `GET /api/accounts/[id]`
**File:** `src/app/api/accounts/[id]/route.ts`

Returns a single account by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "accountNumber": "...",
    "holderName": "...",
    "balance": 12500.00,
    "currency": "SAR",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Error (404):**
```json
{ "success": false, "error": { "message": "الحساب غير موجود" } }
```

**Error (500):**
```json
{ "success": false, "error": { "message": "فشل في جلب الحساب" } }
```

---

### `GET /api/accounts/[id]/transactions`
**File:** `src/app/api/accounts/[id]/transactions/route.ts`

Returns all transfers where `fromAccountId = id` OR `toAccountId = id`, sorted `createdAt DESC`.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "direction": "outgoing",
      "fromAccount": { "id": "...", "accountNumber": "...", "holderName": "..." },
      "toAccount":   { "id": "...", "accountNumber": "...", "holderName": "..." },
      "amount": 1000.00,
      "commission": 20.00,
      "totalAmount": 1020.00,
      "currency": "SAR",
      "status": "COMPLETED",
      "createdAt": "2026-04-10T10:00:00.000Z"
    }
  ]
}
```

`direction` is computed server-side: `fromAccountId === id ? 'outgoing' : 'incoming'`

**Error (404):**
```json
{ "success": false, "error": { "message": "الحساب غير موجود" } }
```

**Error (500):**
```json
{ "success": false, "error": { "message": "فشل في جلب حركات الحساب" } }
```

---

## 5. New Types

Added to `src/types/index.ts` (appended, no existing types changed):

```ts
export interface AccountTransaction {
  id: string;
  direction: 'outgoing' | 'incoming';
  fromAccount: { id: string; accountNumber: string; holderName: string };
  toAccount:   { id: string; accountNumber: string; holderName: string };
  amount: number;
  commission: number;
  totalAmount: number;
  currency: Currency;
  status: TransferStatus;
  createdAt: string;
}
```

`src/lib/api.ts` extended (existing methods unchanged) with:
```ts
api.accounts.getById(id)        // GET /api/accounts/:id
api.accounts.getTransactions(id) // GET /api/accounts/:id/transactions
```

---

## 6. New Pages

### `/accounts` — Accounts Overview
**File:** `src/app/accounts/page.tsx`

- `export const dynamic = 'force-dynamic'`
- Async server component
- Fetches: `prisma.account.findMany({ orderBy: { holderName: 'asc' } })`
- Per-page header: same style as `/transfer` (logo mark "ح", system name, "متصل" badge)
- Page title: "الحسابات" / subtitle "عرض جميع الحسابات ورصيدها الحالي"
- Link to `/transfer` (button/link: "إجراء تحويل جديد")
- Renders `<AccountsTable accounts={accounts} />`
- Empty state if `accounts.length === 0`

### `/accounts/[id]` — Account Statement
**File:** `src/app/accounts/[id]/page.tsx`

- `export const dynamic = 'force-dynamic'`
- Async server component
- Fetches account: `prisma.account.findUnique({ where: { id } })`
- If not found: renders Arabic 404 message (not a thrown error)
- Fetches transactions: `prisma.transfer.findMany({ where: { OR: [...] }, include: { fromAccount: { select: ... }, toAccount: { select: ... } }, orderBy: { createdAt: 'desc' } })`
- Computes `direction` per row server-side
- Per-page header: same style
- Back link: "← الحسابات" → `/accounts`
- Renders `<AccountSummaryCard account={account} />`
- Renders `<AccountTransactionsTable transactions={transactions} />`
- Empty state if no transactions

---

## 7. New Components

All in `src/components/accounts/`:

### `AccountsTable.tsx`
- `'use client'`
- Props: `{ accounts: Account[] }`
- Renders table: holder name | account number | balance | currency | action button
- "عرض الكشف" button → `href="/accounts/${account.id}"`
- Balance formatted with `formatCurrency` from `@/lib/utils`

### `AccountSummaryCard.tsx`
- `'use client'`
- Props: `{ account: Account }`
- Card displaying: holder name, account number, balance (large), currency
- Consistent with existing Card/CardHeader/CardContent from shadcn/ui

### `AccountTransactionsTable.tsx`
- `'use client'`
- Props: `{ transactions: AccountTransaction[] }` — `direction` is already on each row, no `accountId` needed
- Table columns: direction badge | transaction ID (short) | from | to | amount | commission | total | currency | status | date
- Empty state: "لا توجد حركات على هذا الحساب"

### Direction Badge Colors
- **صادر** (outgoing): background `rgba(239,68,68,0.1)`, border `rgba(239,68,68,0.3)`, text `#f87171`
- **وارد** (incoming): background `rgba(34,197,94,0.1)`, border `rgba(34,197,94,0.3)`, text `#4ade80`

### Status Badge Colors
- COMPLETED: background `rgba(201,168,76,0.1)`, border `rgba(201,168,76,0.3)`, text `#c9a84c`
- PENDING: background `rgba(234,179,8,0.1)`, border `rgba(234,179,8,0.3)`, text `#facc15`
- FAILED: background `rgba(239,68,68,0.1)`, border `rgba(239,68,68,0.3)`, text `#f87171`

---

## 8. Data Flow

```
/accounts (server component)
  └─ prisma.account.findMany(...)
  └─ → AccountsTable (client, props only)

/accounts/[id] (server component)
  ├─ prisma.account.findUnique({ where: { id } })
  └─ prisma.transfer.findMany({
       where: { OR: [{ fromAccountId: id }, { toAccountId: id }] },
       include: {
         fromAccount: { select: { id, accountNumber, holderName } },
         toAccount:   { select: { id, accountNumber, holderName } }
       },
       orderBy: { createdAt: 'desc' }
     })
  └─ map rows → add direction field (server-side)
  └─ → AccountSummaryCard + AccountTransactionsTable (client, props only)
```

---

## 9. Files to Create

| File | Type |
|---|---|
| `src/app/api/accounts/[id]/route.ts` | New API route |
| `src/app/api/accounts/[id]/transactions/route.ts` | New API route |
| `src/app/accounts/page.tsx` | New page |
| `src/app/accounts/[id]/page.tsx` | New page |
| `src/components/accounts/AccountsTable.tsx` | New component |
| `src/components/accounts/AccountSummaryCard.tsx` | New component |
| `src/components/accounts/AccountTransactionsTable.tsx` | New component |

## 10. Files to Modify (minimal)

| File | Change |
|---|---|
| `src/types/index.ts` | Append `AccountTransaction` type only |
| `src/lib/api.ts` | Append two new methods to `api.accounts` only |

---

## 11. Files NOT to Touch

- `src/app/transfer/page.tsx`
- `src/app/api/transfer/route.ts`
- `src/app/api/transfer/[id]/route.ts`
- `src/app/api/accounts/route.ts`
- `prisma/schema.prisma`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- All existing components in `src/components/transfer/` and `src/components/ui/`

---

## 12. Testing Checklist

- [ ] `/transfer` page still loads and works end-to-end
- [ ] `/accounts` lists all accounts with correct balances
- [ ] `/accounts` "عرض الكشف" button navigates to `/accounts/[id]`
- [ ] `/accounts/[id]` shows correct account summary
- [ ] `/accounts/[id]` shows all transfers (outgoing + incoming) sorted newest first
- [ ] Direction badges are correct (صادر/وارد)
- [ ] Empty state shown when account has no transactions
- [ ] `/accounts/[id]` shows Arabic error for non-existent account ID
- [ ] `GET /api/accounts/[id]` returns correct response shape
- [ ] `GET /api/accounts/[id]/transactions` returns correct response shape with `direction`
- [ ] `next build` passes with zero TypeScript errors
- [ ] No Prisma generation errors
- [ ] RTL layout is correct on all new pages
