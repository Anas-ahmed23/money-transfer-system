# Money Transfer MVP — Setup Guide

## Architecture Overview

This project is a **Next.js full-stack application** deployed on Vercel.

| Layer | Technology | Location |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | `money-transfer-mvp/frontend/` |
| Database | PostgreSQL via Neon | Managed cloud (Neon dashboard) |
| ORM | Prisma | `frontend/prisma/schema.prisma` |
| Deployment | Vercel | Auto-deploy on push to `main` |

> **Important:** The `money-transfer-mvp/backend/` folder is a local-only Express prototype. It is **not deployed** and has no effect on production. All live API logic lives inside `frontend/src/app/api/`.

---

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Access to the Neon database connection string (from the Vercel dashboard or Neon console)

You do **not** need a local PostgreSQL installation. The database is hosted on Neon.

---

## Local Development Setup

All development work happens inside the `frontend/` directory.

### 1. Install dependencies

```bash
cd money-transfer-mvp/frontend
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in `money-transfer-mvp/frontend/`:

```bash
# money-transfer-mvp/frontend/.env.local
DATABASE_URL="postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require"
```

Get the connection string from:
- Vercel dashboard → Project → Settings → Environment Variables → `DATABASE_URL`
- or directly from the Neon console → Connection Details

> **Never commit `.env.local` to git.** It is already in `.gitignore`.

### 3. Generate Prisma client

```bash
npx prisma generate
```

This must be run after `npm install` if the Prisma client is not already generated. On Vercel, this runs automatically as part of the build (`prisma generate && next build`).

### 4. Start the development server

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

The app redirects to `/transfer` automatically.

---

## Available Routes

| Route | Description |
|---|---|
| `/transfer` | Transfer form — create transfers between accounts |
| `/accounts` | Accounts overview — list all accounts with balances |
| `/accounts/[id]` | Account statement — full transaction history for one account |

---

## Live API Endpoints

All API routes are inside `frontend/src/app/api/` and deployed as Vercel serverless functions.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/accounts` | List all accounts |
| `GET` | `/api/accounts/[id]` | Get single account by ID |
| `GET` | `/api/accounts/[id]/transactions` | Get all transfers for an account |
| `POST` | `/api/transfer` | Create a transfer |
| `GET` | `/api/transfer/[id]` | Get a transfer by ID |

### POST /api/transfer — Request Body

```json
{
  "fromAccountId": "cuid-here",
  "toAccountId": "cuid-here",
  "amount": 1000,
  "currency": "SAR"
}
```

### POST /api/transfer — Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": "...",
    "fromAccountId": "...",
    "toAccountId": "...",
    "amount": 1000,
    "commission": 20,
    "totalAmount": 1020,
    "currency": "SAR",
    "status": "COMPLETED",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "fromAccount": { "id": "...", "holderName": "...", "balance": 48980, "currency": "SAR", ... },
    "toAccount":   { "id": "...", "holderName": "...", "balance": 51000, "currency": "SAR", ... }
  }
}
```

### GET /api/accounts/[id]/transactions — Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "direction": "outgoing",
      "fromAccount": { "id": "...", "accountNumber": "...", "holderName": "..." },
      "toAccount":   { "id": "...", "accountNumber": "...", "holderName": "..." },
      "amount": 1000,
      "commission": 20,
      "totalAmount": 1020,
      "currency": "SAR",
      "status": "COMPLETED",
      "createdAt": "2026-04-10T10:00:00.000Z"
    }
  ]
}
```

`direction` is `"outgoing"` when the queried account is the sender, `"incoming"` when it is the receiver.

### Error Response Shape

```json
{
  "success": false,
  "error": {
    "message": "Arabic error message here"
  }
}
```

---

## Business Rules

| Rule | Value |
|---|---|
| Commission rate | 2% of transfer amount |
| Deducted from source | `amount + commission` |
| Credited to destination | `amount` only |
| Same-account transfer | Rejected |
| Transfer status | Always `COMPLETED` on success |
| Minimum amount | Must be > 0 |
| Maximum amount | 10,000,000 per transfer |

---

## Database

Schema lives at: `money-transfer-mvp/frontend/prisma/schema.prisma`

**Do not delete or move this file.** Prisma requires it to be at this path for client generation on Vercel.

### Making schema changes

If a schema change is ever required:

1. Edit `frontend/prisma/schema.prisma`
2. Run `npx prisma db push` with the Neon `DATABASE_URL` set locally
3. Run `npx prisma generate`
4. Verify `npm run build` passes with zero TypeScript errors
5. Test locally before pushing to `main`

---

## Project Structure (frontend — live app)

```
money-transfer-mvp/frontend/
├── prisma/
│   └── schema.prisma            # Prisma schema — DO NOT DELETE
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (RTL, Arabic fonts)
│   │   ├── page.tsx             # Redirects to /transfer
│   │   ├── globals.css          # Tailwind base + CSS variables
│   │   ├── transfer/
│   │   │   └── page.tsx         # Transfer form (server component)
│   │   ├── accounts/
│   │   │   ├── page.tsx         # Accounts overview (server component)
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Account statement (server component)
│   │   └── api/
│   │       ├── accounts/
│   │       │   ├── route.ts     # GET /api/accounts
│   │       │   └── [id]/
│   │       │       ├── route.ts                  # GET /api/accounts/[id]
│   │       │       └── transactions/
│   │       │           └── route.ts              # GET /api/accounts/[id]/transactions
│   │       └── transfer/
│   │           ├── route.ts     # POST /api/transfer
│   │           └── [id]/
│   │               └── route.ts # GET /api/transfer/[id]
│   ├── components/
│   │   ├── accounts/
│   │   │   ├── AccountsTable.tsx
│   │   │   ├── AccountSummaryCard.tsx
│   │   │   └── AccountTransactionsTable.tsx
│   │   ├── transfer/
│   │   │   ├── TransferForm.tsx
│   │   │   ├── AccountSelect.tsx
│   │   │   └── SummaryCard.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── api.ts               # Typed fetch client
│   │   └── utils.ts             # formatCurrency, calculateCommission, cn()
│   └── types/
│       └── index.ts             # Shared TypeScript types
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deployment

Deployment is fully automatic via Vercel.

- Every push to `main` triggers a production deploy
- Vercel runs: `prisma generate && next build`
- Environment variables (including `DATABASE_URL`) are managed in the Vercel dashboard — do not hardcode them

**Before pushing to `main`:**

1. Run `npm run build` locally — must pass with zero errors
2. Test the transfer flow end-to-end
3. Verify no TypeScript errors: `npx tsc --noEmit`

---

## Common Errors and Fixes

### `Environment variable not found: DATABASE_URL`

**Cause:** `.env.local` is missing or `DATABASE_URL` is not set.

**Fix:** Create `frontend/.env.local` with the correct Neon connection string. See step 2 of Local Development Setup above.

---

### `PrismaClientInitializationError` during `npm run build`

**Cause:** `DATABASE_URL` is not set in the environment where the build runs.

**Fix locally:** Set `DATABASE_URL` in `.env.local` before running `npm run build`.

**On Vercel:** Ensure `DATABASE_URL` is set in the Vercel dashboard → Environment Variables. Vercel injects it automatically during build and runtime.

---

### `PrismaClientKnownRequestError` / `P1001: Can't reach database server`

**Cause:** The Neon database is unreachable (network issue, incorrect URL, or Neon project paused).

**Fix:** Verify the connection string is correct. Check the Neon dashboard to confirm the project is active.

---

### `Cannot find module '@prisma/client'`

**Cause:** Prisma client was not generated after `npm install`.

**Fix:**

```bash
cd money-transfer-mvp/frontend
npx prisma generate
```

---

### TypeScript errors on `account.balance.toNumber()`

**Cause:** Prisma returns `Decimal` type for `balance`. It must be converted to `number` before passing to components or returning from API routes.

**Fix:** Always call `.toNumber()` when serializing Prisma `Decimal` fields. This is already done consistently in all existing API routes and server components.

---

## Supported Currencies

| Code | Arabic Name |
|---|---|
| SAR | ريال سعودي |
| USD | دولار أمريكي |
| EUR | يورو |
| GBP | جنيه إسترليني |
| AED | درهم إماراتي |
