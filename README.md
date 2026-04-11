# Money Transfer System MVP

A production-grade money transfer web application built with Next.js, Prisma, and PostgreSQL. Deployed on Vercel with a Neon managed database.

---

## Overview

This system enables money transfers between accounts with automatic commission calculation, real-time balance updates, and a full transaction history per account. It was built as an Arabic-first RTL web application targeting internal or client-facing fintech use cases.

The MVP is fully deployed and operational. The codebase is structured for continued safe extension without breaking existing functionality.

---

## Features

- **Home page navigation hub** — central entry point linking to all screens with navigation cards
- **Transfer between accounts** — select source and destination account, enter amount and currency
- **Commission calculation** — 2% commission applied automatically, deducted from source account
- **Balance updates** — atomic database transaction ensures both accounts update together or not at all
- **Manual account creation** — create real accounts from inside the app; new accounts appear immediately in transfers and the accounts list
- **Accounts overview** — view all accounts with current balances at a glance
- **Account statement** — per-account transaction history with red/green directional coloring on amounts
- **Multi-currency support** — SAR, USD, EUR, GBP, AED
- **Arabic RTL UI** — fully right-to-left interface using Cairo/Tajawal fonts

---

## Architecture

```
Browser
  └─ Next.js App (Vercel)
       ├─ Pages (React Server/Client Components)
       │    ├─ /                   → navigation hub
       │    ├─ /transfer           → transfer form
       │    ├─ /accounts           → accounts overview
       │    ├─ /accounts/create    → manual account creation
       │    └─ /accounts/[id]      → account statement
       ├─ API Routes (Vercel Serverless Functions)
       │    ├─ GET  /api/accounts
       │    ├─ POST /api/accounts
       │    ├─ GET  /api/accounts/[id]
       │    ├─ GET  /api/accounts/[id]/transactions
       │    ├─ POST /api/transfer
       │    └─ GET  /api/transfer/[id]
       └─ Prisma ORM
            └─ Neon PostgreSQL (managed cloud database)
```

**Key architecture point:** The frontend and backend are the same Next.js application. There is no separate backend server. API routes inside `frontend/src/app/api/` are the live backend, deployed as Vercel serverless functions.

Server components (pages) query Prisma directly for initial page data. API routes handle client-side operations (transfer submission).

---

## Project Structure

```
money-transfer-system/
│
├── money-transfer-mvp/
│   ├── frontend/                  ← LIVE APP — deployed on Vercel
│   │   ├── prisma/
│   │   │   └── schema.prisma      ← Database schema (DO NOT DELETE)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx              ← Home page navigation hub
│   │   │   │   ├── transfer/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── accounts/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/page.tsx   ← Manual account creation form
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── api/
│   │   │   │       ├── accounts/route.ts          ← GET + POST
│   │   │   │       ├── accounts/[id]/route.ts
│   │   │   │       ├── accounts/[id]/transactions/route.ts
│   │   │   │       ├── transfer/route.ts
│   │   │   │       └── transfer/[id]/route.ts
│   │   │   ├── components/
│   │   │   │   ├── accounts/      ← AccountsTable, AccountSummaryCard, AccountTransactionsTable
│   │   │   │   ├── transfer/      ← TransferForm, AccountSelect, SummaryCard
│   │   │   │   └── ui/            ← shadcn/ui primitives
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts      ← Prisma client singleton
│   │   │   │   ├── api.ts         ← Typed fetch client
│   │   │   │   └── utils.ts       ← formatCurrency, calculateCommission
│   │   │   └── types/
│   │   │       └── index.ts       ← Shared TypeScript types
│   │   └── package.json
│   │
│   ├── backend/                   ← LOCAL ONLY — not deployed, not production
│   │   └── (Express prototype — not used in production)
│   │
│   └── docs/
│       ├── SETUP.md               ← Local dev setup guide
│       └── superpowers/
│           ├── plans/             ← Implementation plans
│           └── specs/             ← Design specs
│
└── README.md                      ← This file
```

---

## API Endpoints

All endpoints return `{ success: true, data: ... }` on success and `{ success: false, error: { message: "..." } }` on failure. Error messages are in Arabic.

### GET /api/accounts

Returns all accounts ordered by holder name.

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "accountNumber": "SA01-1234-5678",
      "holderName": "أحمد محمد",
      "balance": 50000.00,
      "currency": "SAR",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/accounts/[id]

Returns a single account by ID. Returns 404 if not found.

### GET /api/accounts/[id]/transactions

Returns all transfers where this account is the sender or receiver, sorted newest first. Each transaction includes a `direction` field.

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
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

`direction`: `"outgoing"` = this account sent the transfer. `"incoming"` = this account received it.

### POST /api/transfer

Creates a transfer. Validates balance, calculates commission, updates both accounts atomically.

**Request body:**
```json
{
  "fromAccountId": "cuid",
  "toAccountId": "cuid",
  "amount": 1000,
  "currency": "SAR"
}
```

**Success (201):** Returns the full transfer object with both account states post-update.

**Errors:**

| Condition | HTTP |
|---|---|
| Invalid request body | 422 |
| Same source and destination | 400 |
| Account not found | 404 |
| Insufficient balance | 400 |
| Server error | 500 |

### POST /api/accounts

Creates a new account. Opening balance is set as the initial balance.

**Request body:**
```json
{
  "holderName": "أحمد محمد",
  "accountNumber": "ACC-001",
  "balance": 5000,
  "currency": "SAR"
}
```

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "accountNumber": "ACC-001",
    "holderName": "أحمد محمد",
    "balance": 5000.00,
    "currency": "SAR",
    "createdAt": "2026-04-11T00:00:00.000Z"
  }
}
```

**Errors:**

| Condition | HTTP |
|---|---|
| Invalid / missing fields | 422 |
| Duplicate accountNumber | 400 |
| Server error | 500 |

### GET /api/transfer/[id]

Returns a single transfer by ID with both account objects included.

---

## Database

Hosted on **Neon** (managed serverless PostgreSQL). The connection string is managed in the Vercel dashboard and must never be hardcoded in source files.

### Schema

**Account**

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| accountNumber | String | Unique |
| holderName | String | Account holder full name |
| balance | Decimal(18,2) | Current balance |
| currency | Currency enum | SAR / USD / EUR / GBP / AED |
| createdAt | DateTime | Auto-set on creation |

**Transfer**

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| fromAccountId | String | FK → Account |
| toAccountId | String | FK → Account |
| amount | Decimal(18,2) | Transfer amount |
| currency | Currency enum | |
| commission | Decimal(18,2) | 2% of amount |
| totalAmount | Decimal(18,2) | amount + commission |
| status | TransferStatus enum | PENDING / COMPLETED / FAILED |
| createdAt | DateTime | Auto-set on creation |

**Relations:** Each Transfer belongs to two Accounts (fromAccount, toAccount). Each Account has two transfer lists (transfersSent, transfersReceived).

### Commission logic

```
commission  = amount × 0.02
totalAmount = amount + commission

source account balance      -= totalAmount
destination account balance += amount        (commission is not passed on)
```

---

## Deployment

### How it works

- GitHub repository is connected to Vercel
- Every push to `main` triggers an automatic production deploy
- Vercel runs `prisma generate && next build` on each deploy
- `DATABASE_URL` is injected by Vercel at build and runtime — it is never in source code

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel dashboard | Neon PostgreSQL connection string |

### Pre-push checklist

Before pushing any change to `main`:

1. Run `npm run build` locally — must complete with zero errors
2. Run `npx tsc --noEmit` — must return zero TypeScript errors
3. Test the transfer flow end-to-end
4. Verify new features work as expected
5. Confirm no existing routes or schema were broken

---

## Development Workflow

1. Work entirely inside `money-transfer-mvp/frontend/`
2. Set `DATABASE_URL` in `.env.local` (Neon connection string from Vercel dashboard)
3. Run `npm run dev` — app starts on port 3000
4. Make and test changes locally
5. Run `npm run build` to verify the build passes
6. Push to `main` — Vercel deploys automatically

**Do not work in `money-transfer-mvp/backend/`** for anything production-related. That folder is a local prototype and has no effect on the live system.

---

## Critical Production Rules

1. **Never modify existing API routes casually.** Every change to `src/app/api/` is a live production change. Test locally first.

2. **Never delete or move `prisma/schema.prisma`.** Prisma client generation during Vercel build depends on this exact path.

3. **Never hardcode `DATABASE_URL` in source code.** It is managed in the Vercel dashboard. Committing it is a security risk.

4. **Never push untested code to `main`.** A broken push means a broken live site. Run `npm run build` and verify the transfer flow before every push.

5. **Never run `prisma migrate` in production.** Use `prisma db push` for schema changes only after understanding the impact on live data.

6. **The `backend/` folder is not production.** Changing it has no effect on the live app. All production logic lives in `frontend/`.

7. **Always test the full transfer flow after any change** — account selection, amount entry, transfer submission, balance update confirmation.

---

## Roadmap

### Phase 3B (next)
- **Extended account fields** — add mobile number and address to account creation and profile
- **Excel import/export** — bulk import accounts from `.xlsx`, export full account list to Excel (SheetJS)

### Future
- **Authentication & authorization** — user login, role-based access (admin, viewer, operator)
- **Transaction reporting** — date range filters, summary stats
- **Admin dashboard** — system-wide transfer volume and account management
- **Notifications** — SMS or email confirmation on transfer completion
- **Audit log** — track who performed which operation and when
- **Multi-branch support** — account ownership by branch or region
- **Enhanced error recovery** — retry logic for failed transfers, manual status override

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel |
| Fonts | Cairo / Tajawal (Google Fonts) |
| Validation | Zod |
| UI direction | RTL (Arabic) |
