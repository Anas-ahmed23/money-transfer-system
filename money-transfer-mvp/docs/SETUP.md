# Money Transfer MVP — Setup Guide

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14 running locally
- npm >= 9.x

---

## 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE money_transfer_db;
```

---

## 2. Backend Setup

```bash
cd money-transfer-mvp/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set your actual DATABASE_URL:
# DATABASE_URL="postgresql://<user>:<password>@localhost:5432/money_transfer_db"

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Seed test data (5 Arabic accounts)
npx ts-node prisma/seed.ts

# Start development server on port 4000
npm run dev
```

Verify backend is running:
- Health check: http://localhost:4000/health → `{"status":"ok",...}`
- Accounts list: http://localhost:4000/api/accounts

---

## 3. Frontend Setup

```bash
cd money-transfer-mvp/frontend

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

Open in browser: http://localhost:3000  
→ Automatically redirects to http://localhost:3000/transfer

---

## 4. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/accounts` | List all accounts |
| POST | `/api/transfer` | Create a transfer |
| GET | `/api/transfer/:id` | Get transfer by ID |

### POST /api/transfer — Request Body

```json
{
  "fromAccountId": "clxxx",
  "toAccountId": "clyyy",
  "amount": 1000,
  "currency": "SAR"
}
```

### POST /api/transfer — Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "fromAccountId": "...",
    "toAccountId": "...",
    "amount": 1000,
    "commission": 20,
    "totalAmount": 1020,
    "currency": "SAR",
    "status": "COMPLETED",
    "createdAt": "2026-04-07T10:00:00.000Z",
    "fromAccount": { "id": "...", "holderName": "...", "balance": 48980, ... },
    "toAccount": { "id": "...", "holderName": "...", "balance": 51000, ... }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "الرصيد غير كافٍ. الرصيد المتاح: ..."
  }
}
```

**Error codes:**

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `SAME_ACCOUNT` | 400 | From and To accounts are identical |
| `ACCOUNT_NOT_FOUND` | 404 | Account ID doesn't exist |
| `INSUFFICIENT_BALANCE` | 400 | Source account has insufficient funds |
| `TRANSFER_NOT_FOUND` | 404 | Transfer ID doesn't exist |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## 5. Business Rules

| Rule | Value |
|------|-------|
| Commission Rate | 2% of transfer amount |
| Total Deducted from Source | `amount + commission` |
| Amount Credited to Target | `amount` only (not commission) |
| Same-account Transfer | Not allowed → `SAME_ACCOUNT` error |
| Minimum Amount | Must be > 0 |
| Insufficient Balance | Rejected → `INSUFFICIENT_BALANCE` error |
| Transfer Status | Always set to `COMPLETED` on success |

---

## 6. Test Accounts (after seed)

| Holder | Account Number | Balance |
|--------|---------------|---------|
| أحمد محمد العمري | SA01-1234-5678 | 50,000.00 SAR |
| فاطمة علي الزهراني | SA02-2345-6789 | 125,000.50 SAR |
| خالد عبدالله القحطاني | SA03-3456-7890 | 8,750.25 SAR |
| نورة سعد الدوسري | SA04-4567-8901 | 200,000.00 SAR |
| عمر يوسف الغامدي | SA05-5678-9012 | 35,500.75 SAR |

---

## 7. Project Structure

```
money-transfer-mvp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Test data seeder
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts      # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── account.controller.ts
│   │   │   └── transfer.controller.ts
│   │   ├── middleware/
│   │   │   └── error.middleware.ts  # AppError + global handler
│   │   ├── routes/
│   │   │   ├── account.routes.ts
│   │   │   ├── transfer.routes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── account.service.ts
│   │   │   └── transfer.service.ts  # Business logic
│   │   ├── types/
│   │   │   └── index.ts         # DTOs and shared types
│   │   ├── validation/
│   │   │   └── transfer.validation.ts  # Zod schemas
│   │   ├── app.ts               # Express app factory
│   │   └── server.ts            # HTTP server entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout (RTL, Arabic font)
│   │   │   ├── page.tsx         # Redirect to /transfer
│   │   │   ├── globals.css      # Tailwind + CSS variables
│   │   │   └── transfer/
│   │   │       └── page.tsx     # Transfer page (Server Component)
│   │   ├── components/
│   │   │   ├── transfer/
│   │   │   │   ├── AccountSelect.tsx
│   │   │   │   ├── SummaryCard.tsx
│   │   │   │   └── TransferForm.tsx
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── api.ts           # Typed fetch client
│   │   │   └── utils.ts         # cn(), formatCurrency(), etc.
│   │   └── types/
│   │       └── index.ts         # Frontend types
│   ├── components.json
│   ├── next.config.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── docs/
    ├── SETUP.md                 # This file
    └── superpowers/
        ├── plans/               # Implementation plans
        └── specs/               # Design specs
```

---

## 8. Supported Currencies

| Code | Name |
|------|------|
| SAR | ريال سعودي |
| USD | دولار أمريكي |
| EUR | يورو |
| GBP | جنيه إسترليني |
| AED | درهم إماراتي |
