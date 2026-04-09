# Money Transfer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready money transfer web application (MVP) with an Arabic RTL UI supporting account-to-account transfers with automatic 2% commission calculation.

**Architecture:** Clean separation between a Node.js/Express/TypeScript backend (controllers → services pattern, Prisma ORM, PostgreSQL) and a Next.js 14 App Router frontend (TypeScript, Tailwind CSS, shadcn/ui, full RTL Arabic). The backend exposes a JSON REST API consumed by the frontend via a typed fetch client.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Express, Prisma, PostgreSQL, Zod

---

## File Map

### Backend (`backend/`)
| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Database schema — Account, Transfer models |
| `prisma/seed.ts` | 5 seeded test accounts |
| `src/types/index.ts` | Shared TypeScript types and DTOs |
| `src/config/database.ts` | Prisma client singleton |
| `src/middleware/error.middleware.ts` | AppError class + global Express error handler |
| `src/validation/transfer.validation.ts` | Zod schema for POST /transfer body |
| `src/services/account.service.ts` | DB read logic for accounts |
| `src/services/transfer.service.ts` | Business logic: commission, balance checks, atomic transaction |
| `src/controllers/account.controller.ts` | HTTP handler for GET /accounts |
| `src/controllers/transfer.controller.ts` | HTTP handlers for POST /transfer, GET /transfer/:id |
| `src/routes/account.routes.ts` | Account router |
| `src/routes/transfer.routes.ts` | Transfer router |
| `src/routes/index.ts` | Mounts all routers under /api |
| `src/app.ts` | Express app factory (middleware, routes, error handler) |
| `src/server.ts` | HTTP server entry point |
| `package.json` | Backend deps and scripts |
| `tsconfig.json` | TypeScript config |
| `.env.example` | Required environment variables |

### Frontend (`frontend/`)
| File | Responsibility |
|------|---------------|
| `src/types/index.ts` | Mirrors backend types for frontend use |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/lib/api.ts` | Typed fetch client for backend API |
| `src/components/ui/button.tsx` | shadcn Button |
| `src/components/ui/input.tsx` | shadcn Input |
| `src/components/ui/label.tsx` | shadcn Label |
| `src/components/ui/select.tsx` | shadcn Select |
| `src/components/ui/card.tsx` | shadcn Card |
| `src/components/ui/badge.tsx` | shadcn Badge |
| `src/components/transfer/AccountSelect.tsx` | Dropdown for picking an account with balance display |
| `src/components/transfer/SummaryCard.tsx` | Live commission + total calculation display |
| `src/components/transfer/TransferForm.tsx` | Full transfer form orchestrating all sub-components |
| `src/app/layout.tsx` | Root layout with RTL dir, Arabic font, metadata |
| `src/app/page.tsx` | Root redirect to /transfer |
| `src/app/transfer/page.tsx` | Transfer page — fetches accounts, renders TransferForm |
| `src/app/globals.css` | Tailwind directives + CSS variables |
| `tailwind.config.ts` | Tailwind config with RTL plugin, custom colors |
| `next.config.ts` | Next.js config with API proxy |
| `components.json` | shadcn/ui config |

---

## Task 1: Scaffold Project Directories and Backend Package

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p money-transfer-mvp/backend/src/{types,config,middleware,validation,services,controllers,routes}
mkdir -p money-transfer-mvp/backend/prisma
mkdir -p money-transfer-mvp/frontend
mkdir -p money-transfer-mvp/docs
cd money-transfer-mvp/backend
```

- [ ] **Step 2: Write `backend/package.json`**

```json
{
  "name": "money-transfer-backend",
  "version": "1.0.0",
  "description": "Money Transfer MVP - Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset --force && ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.24",
    "prisma": "^5.10.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.2"
  }
}
```

- [ ] **Step 3: Write `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Write `backend/.env.example`**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/money_transfer_db"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 5: Install backend dependencies**

```bash
cd money-transfer-mvp/backend
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add money-transfer-mvp/backend/package.json money-transfer-mvp/backend/tsconfig.json money-transfer-mvp/backend/.env.example
git commit -m "feat: scaffold backend project with TypeScript and dependencies"
```

---

## Task 2: Prisma Schema and Seed Data

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/seed.ts`

- [ ] **Step 1: Write `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Currency {
  SAR
  USD
  EUR
  GBP
  AED
}

enum TransferStatus {
  PENDING
  COMPLETED
  FAILED
}

model Account {
  id            String    @id @default(cuid())
  accountNumber String    @unique
  holderName    String
  balance       Decimal   @db.Decimal(18, 2)
  currency      Currency  @default(SAR)
  createdAt     DateTime  @default(now())

  transfersSent     Transfer[] @relation("FromAccount")
  transfersReceived Transfer[] @relation("ToAccount")
}

model Transfer {
  id            String         @id @default(cuid())
  fromAccountId String
  toAccountId   String
  amount        Decimal        @db.Decimal(18, 2)
  currency      Currency
  commission    Decimal        @db.Decimal(18, 2)
  totalAmount   Decimal        @db.Decimal(18, 2)
  status        TransferStatus @default(PENDING)
  createdAt     DateTime       @default(now())

  fromAccount Account @relation("FromAccount", fields: [fromAccountId], references: [id])
  toAccount   Account @relation("ToAccount", fields: [toAccountId], references: [id])
}
```

- [ ] **Step 2: Write `backend/prisma/seed.ts`**

```typescript
import { PrismaClient, Currency } from '@prisma/client';

const prisma = new PrismaClient();

const accounts = [
  {
    accountNumber: 'SA01-1234-5678',
    holderName: 'أحمد محمد العمري',
    balance: 50000.00,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA02-2345-6789',
    holderName: 'فاطمة علي الزهراني',
    balance: 125000.50,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA03-3456-7890',
    holderName: 'خالد عبدالله القحطاني',
    balance: 8750.25,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA04-4567-8901',
    holderName: 'نورة سعد الدوسري',
    balance: 200000.00,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA05-5678-9012',
    holderName: 'عمر يوسف الغامدي',
    balance: 35500.75,
    currency: Currency.SAR,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { accountNumber: account.accountNumber },
      update: {},
      create: account,
    });
  }

  console.log(`✅ Seeded ${accounts.length} accounts successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Create `.env` from example and run migration**

```bash
cd money-transfer-mvp/backend
cp .env.example .env
# Edit .env with your actual DATABASE_URL
npx prisma migrate dev --name init
```

Expected output: `✓ Generated Prisma Client`, migration applied.

- [ ] **Step 4: Run seed**

```bash
npx ts-node prisma/seed.ts
```

Expected: `✅ Seeded 5 accounts successfully.`

- [ ] **Step 5: Commit**

```bash
git add money-transfer-mvp/backend/prisma/
git commit -m "feat: add Prisma schema with Account/Transfer models and seed data"
```

---

## Task 3: Backend Core Infrastructure

**Files:**
- Create: `backend/src/types/index.ts`
- Create: `backend/src/config/database.ts`
- Create: `backend/src/middleware/error.middleware.ts`
- Create: `backend/src/validation/transfer.validation.ts`

- [ ] **Step 1: Write `backend/src/types/index.ts`**

```typescript
export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface AccountDto {
  id: string;
  accountNumber: string;
  holderName: string;
  balance: number;
  currency: Currency;
  createdAt: string;
}

export interface CreateTransferDto {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
}

export interface TransferDto {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
  commission: number;
  totalAmount: number;
  status: TransferStatus;
  createdAt: string;
  fromAccount: AccountDto;
  toAccount: AccountDto;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

- [ ] **Step 2: Write `backend/src/config/database.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Write `backend/src/middleware/error.middleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'حدث خطأ داخلي في الخادم',
    },
  });
}
```

- [ ] **Step 4: Write `backend/src/validation/transfer.validation.ts`**

```typescript
import { z } from 'zod';

const CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED'] as const;

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'حساب المصدر مطلوب'),
  toAccountId: z.string().min(1, 'حساب الوجهة مطلوب'),
  amount: z
    .number({ invalid_type_error: 'المبلغ يجب أن يكون رقماً' })
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .max(10_000_000, 'المبلغ يتجاوز الحد المسموح به'),
  currency: z.enum(CURRENCIES, {
    errorMap: () => ({ message: 'العملة غير صالحة' }),
  }),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
```

- [ ] **Step 5: Commit**

```bash
git add money-transfer-mvp/backend/src/types/ money-transfer-mvp/backend/src/config/ money-transfer-mvp/backend/src/middleware/ money-transfer-mvp/backend/src/validation/
git commit -m "feat: add backend core — types, db config, error middleware, validation"
```

---

## Task 4: Account Service and Controller

**Files:**
- Create: `backend/src/services/account.service.ts`
- Create: `backend/src/controllers/account.controller.ts`

- [ ] **Step 1: Write `backend/src/services/account.service.ts`**

```typescript
import { prisma } from '../config/database';
import { AccountDto } from '../types';

function toAccountDto(account: {
  id: string;
  accountNumber: string;
  holderName: string;
  balance: { toNumber: () => number };
  currency: string;
  createdAt: Date;
}): AccountDto {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    holderName: account.holderName,
    balance: account.balance.toNumber(),
    currency: account.currency as AccountDto['currency'],
    createdAt: account.createdAt.toISOString(),
  };
}

export class AccountService {
  async findAll(): Promise<AccountDto[]> {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
    });
    return accounts.map(toAccountDto);
  }

  async findById(id: string): Promise<AccountDto | null> {
    const account = await prisma.account.findUnique({ where: { id } });
    return account ? toAccountDto(account) : null;
  }
}
```

- [ ] **Step 2: Write `backend/src/controllers/account.controller.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/account.service';

const accountService = new AccountService();

export async function getAccounts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accounts = await accountService.findAll();
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add money-transfer-mvp/backend/src/services/account.service.ts money-transfer-mvp/backend/src/controllers/account.controller.ts
git commit -m "feat: add account service and controller"
```

---

## Task 5: Transfer Service (Business Logic)

**Files:**
- Create: `backend/src/services/transfer.service.ts`

- [ ] **Step 1: Write `backend/src/services/transfer.service.ts`**

```typescript
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { CreateTransferInput } from '../validation/transfer.validation';
import { TransferDto } from '../types';

const COMMISSION_RATE = 0.02;

function toTransferDto(transfer: {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: { toNumber: () => number };
  currency: string;
  commission: { toNumber: () => number };
  totalAmount: { toNumber: () => number };
  status: string;
  createdAt: Date;
  fromAccount: {
    id: string;
    accountNumber: string;
    holderName: string;
    balance: { toNumber: () => number };
    currency: string;
    createdAt: Date;
  };
  toAccount: {
    id: string;
    accountNumber: string;
    holderName: string;
    balance: { toNumber: () => number };
    currency: string;
    createdAt: Date;
  };
}): TransferDto {
  return {
    id: transfer.id,
    fromAccountId: transfer.fromAccountId,
    toAccountId: transfer.toAccountId,
    amount: transfer.amount.toNumber(),
    currency: transfer.currency as TransferDto['currency'],
    commission: transfer.commission.toNumber(),
    totalAmount: transfer.totalAmount.toNumber(),
    status: transfer.status as TransferDto['status'],
    createdAt: transfer.createdAt.toISOString(),
    fromAccount: {
      id: transfer.fromAccount.id,
      accountNumber: transfer.fromAccount.accountNumber,
      holderName: transfer.fromAccount.holderName,
      balance: transfer.fromAccount.balance.toNumber(),
      currency: transfer.fromAccount.currency as TransferDto['currency'],
      createdAt: transfer.fromAccount.createdAt.toISOString(),
    },
    toAccount: {
      id: transfer.toAccount.id,
      accountNumber: transfer.toAccount.accountNumber,
      holderName: transfer.toAccount.holderName,
      balance: transfer.toAccount.balance.toNumber(),
      currency: transfer.toAccount.currency as TransferDto['currency'],
      createdAt: transfer.toAccount.createdAt.toISOString(),
    },
  };
}

export class TransferService {
  async createTransfer(input: CreateTransferInput): Promise<TransferDto> {
    const { fromAccountId, toAccountId, amount, currency } = input;

    if (fromAccountId === toAccountId) {
      throw new AppError('لا يمكن التحويل إلى نفس الحساب', 400, 'SAME_ACCOUNT');
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: fromAccountId } }),
      prisma.account.findUnique({ where: { id: toAccountId } }),
    ]);

    if (!fromAccount) {
      throw new AppError('حساب المصدر غير موجود', 404, 'ACCOUNT_NOT_FOUND');
    }
    if (!toAccount) {
      throw new AppError('حساب الوجهة غير موجود', 404, 'ACCOUNT_NOT_FOUND');
    }

    const commission = parseFloat((amount * COMMISSION_RATE).toFixed(2));
    const totalAmount = parseFloat((amount + commission).toFixed(2));

    if (fromAccount.balance.toNumber() < totalAmount) {
      throw new AppError(
        `الرصيد غير كافٍ. الرصيد المتاح: ${fromAccount.balance.toNumber().toLocaleString('ar-SA')} ${fromAccount.currency}`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const newTransfer = await tx.transfer.create({
        data: {
          fromAccountId,
          toAccountId,
          amount: new Decimal(amount),
          currency,
          commission: new Decimal(commission),
          totalAmount: new Decimal(totalAmount),
          status: 'COMPLETED',
        },
        include: { fromAccount: true, toAccount: true },
      });

      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: totalAmount } },
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      return newTransfer;
    });

    return toTransferDto(transfer);
  }

  async findById(id: string): Promise<TransferDto> {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { fromAccount: true, toAccount: true },
    });

    if (!transfer) {
      throw new AppError('التحويل غير موجود', 404, 'TRANSFER_NOT_FOUND');
    }

    return toTransferDto(transfer);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add money-transfer-mvp/backend/src/services/transfer.service.ts
git commit -m "feat: add transfer service with commission calculation and atomic transaction"
```

---

## Task 6: Transfer Controller, Routes, App, and Server

**Files:**
- Create: `backend/src/controllers/transfer.controller.ts`
- Create: `backend/src/routes/account.routes.ts`
- Create: `backend/src/routes/transfer.routes.ts`
- Create: `backend/src/routes/index.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`

- [ ] **Step 1: Write `backend/src/controllers/transfer.controller.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { TransferService } from '../services/transfer.service';
import { createTransferSchema } from '../validation/transfer.validation';
import { AppError } from '../middleware/error.middleware';

const transferService = new TransferService();

export async function createTransfer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createTransferSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ');
      throw new AppError(message, 422, 'VALIDATION_ERROR');
    }

    const transfer = await transferService.createTransfer(parsed.data);
    res.status(201).json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}

export async function getTransferById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const transfer = await transferService.findById(id);
    res.json({ success: true, data: transfer });
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 2: Write `backend/src/routes/account.routes.ts`**

```typescript
import { Router } from 'express';
import { getAccounts } from '../controllers/account.controller';

const router = Router();

router.get('/', getAccounts);

export default router;
```

- [ ] **Step 3: Write `backend/src/routes/transfer.routes.ts`**

```typescript
import { Router } from 'express';
import { createTransfer, getTransferById } from '../controllers/transfer.controller';

const router = Router();

router.post('/', createTransfer);
router.get('/:id', getTransferById);

export default router;
```

- [ ] **Step 4: Write `backend/src/routes/index.ts`**

```typescript
import { Router } from 'express';
import accountRouter from './account.routes';
import transferRouter from './transfer.routes';

const router = Router();

router.use('/accounts', accountRouter);
router.use('/transfer', transferRouter);

export default router;
```

- [ ] **Step 5: Write `backend/src/app.ts`**

```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);

  app.use(errorMiddleware);

  return app;
}
```

- [ ] **Step 6: Write `backend/src/server.ts`**

```typescript
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
```

- [ ] **Step 7: Commit**

```bash
git add money-transfer-mvp/backend/src/
git commit -m "feat: add transfer controller, routes, Express app, and server entry point"
```

---

## Task 7: Frontend Bootstrap — Next.js, Tailwind, shadcn

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.mjs`
- Create: `frontend/components.json`

- [ ] **Step 1: Write `frontend/package.json`**

```json
{
  "name": "money-transfer-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.1",
    "react": "^18",
    "react-dom": "^18",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.372.0",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Write `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `frontend/next.config.ts`**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Write `frontend/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

- [ ] **Step 5: Write `frontend/postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 6: Write `frontend/components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 7: Install frontend dependencies**

```bash
cd money-transfer-mvp/frontend
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Commit**

```bash
git add money-transfer-mvp/frontend/package.json money-transfer-mvp/frontend/tsconfig.json money-transfer-mvp/frontend/next.config.ts money-transfer-mvp/frontend/tailwind.config.ts money-transfer-mvp/frontend/postcss.config.mjs money-transfer-mvp/frontend/components.json
git commit -m "feat: scaffold Next.js frontend with Tailwind and shadcn configuration"
```

---

## Task 8: Frontend — globals.css, Types, Utils, and API Client

**Files:**
- Create: `frontend/src/app/globals.css`
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/utils.ts`
- Create: `frontend/src/lib/api.ts`

- [ ] **Step 1: Write `frontend/src/app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-arabic;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

- [ ] **Step 2: Write `frontend/src/types/index.ts`**

```typescript
export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Account {
  id: string;
  accountNumber: string;
  holderName: string;
  balance: number;
  currency: Currency;
  createdAt: string;
}

export interface CreateTransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
  commission: number;
  totalAmount: number;
  status: TransferStatus;
  createdAt: string;
  fromAccount: Account;
  toAccount: Account;
}

export interface TransferFormValues {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  currency: Currency;
}

export interface TransferSummary {
  amount: number;
  commission: number;
  totalAmount: number;
  currency: Currency;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  SAR: 'ريال سعودي',
  USD: 'دولار أمريكي',
  EUR: 'يورو',
  GBP: 'جنيه إسترليني',
  AED: 'درهم إماراتي',
};

export const COMMISSION_RATE = 0.02;
```

- [ ] **Step 3: Write `frontend/src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateCommission(amount: number, rate = 0.02): number {
  return parseFloat((amount * rate).toFixed(2));
}

export function calculateTotal(amount: number, commission: number): number {
  return parseFloat((amount + commission).toFixed(2));
}
```

- [ ] **Step 4: Write `frontend/src/lib/api.ts`**

```typescript
import { Account, ApiResponse, CreateTransferPayload, Transfer } from '@/types';

const BASE_URL = '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const json = await response.json();

  if (!response.ok) {
    const errorBody = json as { error?: { message?: string } };
    throw new Error(errorBody.error?.message ?? 'حدث خطأ غير متوقع');
  }

  return json as ApiResponse<T>;
}

export const api = {
  accounts: {
    list(): Promise<ApiResponse<Account[]>> {
      return request<Account[]>('/accounts');
    },
  },
  transfers: {
    create(payload: CreateTransferPayload): Promise<ApiResponse<Transfer>> {
      return request<Transfer>('/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getById(id: string): Promise<ApiResponse<Transfer>> {
      return request<Transfer>(`/transfer/${id}`);
    },
  },
};
```

- [ ] **Step 5: Commit**

```bash
git add money-transfer-mvp/frontend/src/app/globals.css money-transfer-mvp/frontend/src/types/ money-transfer-mvp/frontend/src/lib/
git commit -m "feat: add frontend types, API client, utility functions, and global CSS"
```

---

## Task 9: shadcn/ui Base Components

**Files:**
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/input.tsx`
- Create: `frontend/src/components/ui/label.tsx`
- Create: `frontend/src/components/ui/select.tsx`
- Create: `frontend/src/components/ui/card.tsx`
- Create: `frontend/src/components/ui/badge.tsx`

- [ ] **Step 1: Write `frontend/src/components/ui/button.tsx`**

```typescript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

- [ ] **Step 2: Write `frontend/src/components/ui/input.tsx`**

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

- [ ] **Step 3: Write `frontend/src/components/ui/label.tsx`**

```typescript
'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

- [ ] **Step 4: Write `frontend/src/components/ui/select.tsx`**

```typescript
'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

- [ ] **Step 5: Write `frontend/src/components/ui/card.tsx`**

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

- [ ] **Step 6: Write `frontend/src/components/ui/badge.tsx`**

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

- [ ] **Step 7: Commit**

```bash
git add money-transfer-mvp/frontend/src/components/ui/
git commit -m "feat: add shadcn/ui base components (Button, Input, Label, Select, Card, Badge)"
```

---

## Task 10: Transfer Feature Components

**Files:**
- Create: `frontend/src/components/transfer/AccountSelect.tsx`
- Create: `frontend/src/components/transfer/SummaryCard.tsx`
- Create: `frontend/src/components/transfer/TransferForm.tsx`

- [ ] **Step 1: Write `frontend/src/components/transfer/AccountSelect.tsx`**

```typescript
'use client';

import { Account, Currency } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccountSelectProps {
  label: string;
  accounts: Account[];
  value: string;
  excludeId?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

export function AccountSelect({
  label,
  accounts,
  value,
  excludeId,
  disabled = false,
  onValueChange,
}: AccountSelectProps) {
  const availableAccounts = excludeId
    ? accounts.filter((a) => a.id !== excludeId)
    : accounts;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-12 text-right">
          <SelectValue placeholder="اختر الحساب" />
        </SelectTrigger>
        <SelectContent>
          {availableAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id} className="py-3">
              <div className="flex flex-col gap-0.5 text-right">
                <span className="font-semibold text-sm">{account.holderName}</span>
                <span className="text-xs text-muted-foreground">
                  {account.accountNumber} · {formatCurrency(account.balance, account.currency as Currency)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Write `frontend/src/components/transfer/SummaryCard.tsx`**

```typescript
import { TransferSummary, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SummaryCardProps {
  summary: TransferSummary | null;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary || summary.amount <= 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">أدخل مبلغ التحويل لعرض الملخص</p>
        </CardContent>
      </Card>
    );
  }

  const { amount, commission, totalAmount, currency } = summary;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
          <span>📊</span>
          <span>ملخص التحويل</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">المبلغ الأصلي</span>
          <span className="font-semibold text-sm">{formatCurrency(amount, currency)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">العمولة (2%)</span>
          <span className="font-semibold text-sm text-amber-600">
            + {formatCurrency(commission, currency)}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground">إجمالي المبلغ المخصوم</span>
          <span className="font-bold text-primary text-lg">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-1">
          العملة: {CURRENCY_LABELS[currency]}
        </p>
      </CardContent>
    </Card>
  );
}
```

Note: `Separator` needs to be added. Write `frontend/src/components/ui/separator.tsx`:

```typescript
'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
```

Also add `@radix-ui/react-separator` to frontend `package.json` dependencies:
```json
"@radix-ui/react-separator": "^1.0.3",
```
Then run `npm install` in `frontend/`.

- [ ] **Step 3: Write `frontend/src/components/transfer/TransferForm.tsx`**

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Account, TransferFormValues, TransferSummary, Currency, CURRENCY_LABELS } from '@/types';
import { calculateCommission, calculateTotal, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { AccountSelect } from './AccountSelect';
import { SummaryCard } from './SummaryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TransferFormProps {
  accounts: Account[];
}

type FormErrors = Partial<Record<keyof TransferFormValues, string>>;

const CURRENCIES: Currency[] = ['SAR', 'USD', 'EUR', 'GBP', 'AED'];

const INITIAL_VALUES: TransferFormValues = {
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  currency: 'SAR',
};

export function TransferForm({ accounts }: TransferFormProps) {
  const [values, setValues] = useState<TransferFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === values.fromAccountId) ?? null,
    [accounts, values.fromAccountId]
  );

  const summary = useMemo((): TransferSummary | null => {
    const amount = parseFloat(values.amount);
    if (!values.amount || isNaN(amount) || amount <= 0) return null;
    const commission = calculateCommission(amount);
    const totalAmount = calculateTotal(amount, commission);
    return { amount, commission, totalAmount, currency: values.currency };
  }, [values.amount, values.currency]);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!values.fromAccountId) errs.fromAccountId = 'يرجى اختيار حساب المصدر';
    if (!values.toAccountId) errs.toAccountId = 'يرجى اختيار حساب الوجهة';
    if (values.fromAccountId && values.toAccountId && values.fromAccountId === values.toAccountId) {
      errs.toAccountId = 'لا يمكن التحويل إلى نفس الحساب';
    }

    const amount = parseFloat(values.amount);
    if (!values.amount || isNaN(amount)) {
      errs.amount = 'يرجى إدخال مبلغ صحيح';
    } else if (amount <= 0) {
      errs.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    } else if (fromAccount && summary && fromAccount.balance < summary.totalAmount) {
      errs.amount = `الرصيد غير كافٍ. الرصيد المتاح: ${formatCurrency(fromAccount.balance, fromAccount.currency as Currency)}`;
    }

    return errs;
  }, [values, fromAccount, summary]);

  const handleFieldChange = useCallback(
    (field: keyof TransferFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setApiError(null);
      setSuccessMessage(null);
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.transfers.create({
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        amount: parseFloat(values.amount),
        currency: values.currency,
      });

      const transfer = response.data;
      setSuccessMessage(
        `✅ تم التحويل بنجاح! رقم العملية: ${transfer.id.slice(0, 8).toUpperCase()}`
      );
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'حدث خطأ أثناء تنفيذ التحويل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg">
              ↗
            </div>
            <div>
              <CardTitle className="text-xl font-bold">تحويل الأموال</CardTitle>
              <CardDescription>أدخل تفاصيل التحويل بين الحسابات</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-green-800 font-medium text-sm">{successMessage}</p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-destructive font-medium text-sm">{apiError}</p>
            </div>
          )}

          {/* From Account */}
          <div>
            <AccountSelect
              label="من حساب"
              accounts={accounts}
              value={values.fromAccountId}
              onValueChange={(v) => handleFieldChange('fromAccountId', v)}
            />
            {errors.fromAccountId && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.fromAccountId}</p>
            )}
            {fromAccount && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                الرصيد المتاح:{' '}
                <span className="font-semibold text-foreground">
                  {formatCurrency(fromAccount.balance, fromAccount.currency as Currency)}
                </span>
              </p>
            )}
          </div>

          {/* To Account */}
          <div>
            <AccountSelect
              label="إلى حساب"
              accounts={accounts}
              value={values.toAccountId}
              excludeId={values.fromAccountId}
              onValueChange={(v) => handleFieldChange('toAccountId', v)}
            />
            {errors.toAccountId && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.toAccountId}</p>
            )}
          </div>

          {/* Amount + Currency Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-semibold">المبلغ</Label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={values.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                className={`h-12 text-left tabular-nums text-base ${errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                dir="ltr"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-destructive font-medium">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">العملة</Label>
              <Select
                value={values.currency}
                onValueChange={(v) => handleFieldChange('currency', v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="font-mono font-bold text-xs">{c}</span>
                      <span className="text-xs text-muted-foreground mr-1">· {CURRENCY_LABELS[c]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Commission Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              العمولة: 2%
            </Badge>
            {summary && (
              <span className="text-xs text-muted-foreground">
                = {formatCurrency(summary.commission, summary.currency)}
              </span>
            )}
          </div>

          {/* Summary Card */}
          <SummaryCard summary={summary} />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-13 text-base font-bold tracking-wide"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                جاري التنفيذ...
              </span>
            ) : (
              'تنفيذ التحويل'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add money-transfer-mvp/frontend/src/components/
git commit -m "feat: add transfer feature components — AccountSelect, SummaryCard, TransferForm"
```

---

## Task 11: Frontend Pages and Root Layout

**Files:**
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/transfer/page.tsx`

- [ ] **Step 1: Write `frontend/src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام تحويل الأموال',
  description: 'منصة آمنة وسريعة لتحويل الأموال بين الحسابات',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased font-arabic">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write `frontend/src/app/page.tsx`**

```typescript
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/transfer');
}
```

- [ ] **Step 3: Write `frontend/src/app/transfer/page.tsx`**

```typescript
import { TransferForm } from '@/components/transfer/TransferForm';
import { Account } from '@/types';

async function getAccounts(): Promise<Account[]> {
  try {
    const res = await fetch('http://localhost:4000/api/accounts', {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function TransferPage() {
  const accounts = await getAccounts();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              ت
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-none">نظام التحويلات</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Money Transfer System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              متصل
            </span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">تحويل الأموال</h2>
            <p className="text-muted-foreground">
              حوّل الأموال بين الحسابات بأمان وسرعة
            </p>
          </div>

          {/* No Accounts State */}
          {accounts.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-dashed">
              <p className="text-muted-foreground font-medium">
                تعذر تحميل الحسابات. تأكد من تشغيل الخادم الخلفي.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Backend: http://localhost:4000
              </p>
            </div>
          ) : (
            <TransferForm accounts={accounts} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add money-transfer-mvp/frontend/src/app/
git commit -m "feat: add Next.js app layout, transfer page with Arabic RTL header and footer"
```

---

## Task 12: Setup Documentation

**Files:**
- Create: `docs/SETUP.md`

- [ ] **Step 1: Write `docs/SETUP.md`**

```markdown
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
# Edit .env and set your DATABASE_URL:
# DATABASE_URL="postgresql://<user>:<password>@localhost:5432/money_transfer_db"

# Run database migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed test data (5 accounts)
npx ts-node prisma/seed.ts

# Start development server (port 4000)
npm run dev
```

Verify: http://localhost:4000/health → `{"status":"ok",...}`

---

## 3. Frontend Setup

```bash
cd money-transfer-mvp/frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

Open: http://localhost:3000 → redirects to http://localhost:3000/transfer

---

## 4. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/accounts | List all accounts |
| POST | /api/transfer | Create a transfer |
| GET | /api/transfer/:id | Get transfer by ID |

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
    "createdAt": "2026-04-07T...",
    "fromAccount": { ... },
    "toAccount": { ... }
  }
}
```

---

## 5. Business Rules

| Rule | Value |
|------|-------|
| Commission Rate | 2% of transfer amount |
| Total Deducted | amount + commission |
| Amount Credited | amount only (not commission) |
| Same Account | Not allowed |
| Minimum Amount | > 0 |
| Insufficient Balance | Transfer rejected |

---

## 6. Test Accounts (after seed)

| Holder | Account Number | Balance |
|--------|---------------|---------|
| أحمد محمد العمري | SA01-1234-5678 | 50,000 SAR |
| فاطمة علي الزهراني | SA02-2345-6789 | 125,000.50 SAR |
| خالد عبدالله القحطاني | SA03-3456-7890 | 8,750.25 SAR |
| نورة سعد الدوسري | SA04-4567-8901 | 200,000 SAR |
| عمر يوسف الغامدي | SA05-5678-9012 | 35,500.75 SAR |
```

- [ ] **Step 2: Commit**

```bash
git add money-transfer-mvp/docs/
git commit -m "docs: add setup guide with API reference, business rules, and test accounts"
```

---

## Self-Review Checklist

### Spec Coverage
- [x] From/To account dropdowns — AccountSelect component
- [x] Amount input — TransferForm Input field
- [x] Currency dropdown — TransferForm currency Select
- [x] Commission auto-calculated (2%) — calculateCommission() in utils.ts
- [x] Total = amount + commission — calculateTotal() in utils.ts
- [x] Prevent same-account transfer — frontend validate() + backend TransferService
- [x] Validate sufficient balance — frontend validate() + backend TransferService
- [x] Amount > 0 — frontend validate() + Zod schema
- [x] POST /transfer — transfer.routes.ts
- [x] GET /accounts — account.routes.ts
- [x] GET /transfer/:id — transfer.routes.ts
- [x] Account schema (id, accountNumber, holderName, balance, currency, createdAt) — schema.prisma
- [x] Transfer schema (id, fromAccountId, toAccountId, amount, currency, commission, totalAmount, status, createdAt) — schema.prisma
- [x] Arabic RTL UI — layout.tsx dir="rtl", Cairo font, all labels in Arabic
- [x] Submit button: "تنفيذ التحويل" — TransferForm.tsx
- [x] Live commission/total calculation — SummaryCard with useMemo
- [x] Seed data — seed.ts (5 Arabic accounts)
- [x] Setup instructions — docs/SETUP.md
- [x] controllers / routes / services separation — all present
- [x] Validation + error handling — Zod validation, AppError, errorMiddleware

### Type Consistency
- `AccountDto` in backend matches `Account` in frontend types
- `TransferDto` in backend matches `Transfer` in frontend types
- `CreateTransferDto` in backend = `CreateTransferPayload` in frontend (different name for clear directional intent — both correct)
- `Currency` enum values consistent across all files: `SAR | USD | EUR | GBP | AED`
- `TransferStatus` consistent: `PENDING | COMPLETED | FAILED`
- `toTransferDto()` maps all Prisma Decimal fields with `.toNumber()`
- `calculateCommission` and `calculateTotal` in utils.ts used consistently in SummaryCard and TransferForm
```
