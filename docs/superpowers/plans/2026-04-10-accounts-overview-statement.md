# Accounts Overview & Statement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/accounts` (accounts overview) and `/accounts/[id]` (account statement) screens to the live Money Transfer MVP, backed by two new API routes, with zero changes to any existing working file except additive type/api extensions.

**Architecture:** Both new pages are async server components that query Prisma directly — the same pattern used by the existing `/transfer` page. New API routes are created for completeness and future use but pages do not call them internally. All computed fields (`direction`) are derived server-side before being passed as props to client components.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma (PostgreSQL/Neon), Tailwind CSS, shadcn/ui, Arabic RTL (Cairo/Tajawal fonts)

> **Note on testing:** This project has no test framework set up. "Verification" steps use TypeScript compilation (`tsc --noEmit`) and `next build` as the correctness gate, plus a manual browser checklist at the end. Setting up Jest/Vitest is out of scope (YAGNI).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/types/index.ts` | Modify (append only) | Add `AccountTransaction` type |
| `src/lib/api.ts` | Modify (extend only) | Add `getById` + `getTransactions` to `api.accounts` |
| `src/app/api/accounts/[id]/route.ts` | Create | `GET /api/accounts/:id` — single account |
| `src/app/api/accounts/[id]/transactions/route.ts` | Create | `GET /api/accounts/:id/transactions` — transfer history with direction |
| `src/components/accounts/AccountsTable.tsx` | Create | Client component: renders accounts list table |
| `src/components/accounts/AccountSummaryCard.tsx` | Create | Client component: renders account summary card |
| `src/components/accounts/AccountTransactionsTable.tsx` | Create | Client component: renders full transaction history table |
| `src/app/accounts/page.tsx` | Create | Server page: accounts overview, direct Prisma |
| `src/app/accounts/[id]/page.tsx` | Create | Server page: account statement, direct Prisma |

**Files NOT to touch:** `src/app/transfer/page.tsx`, `src/app/api/transfer/route.ts`, `src/app/api/transfer/[id]/route.ts`, `src/app/api/accounts/route.ts`, `prisma/schema.prisma`, `src/app/layout.tsx`, `src/app/page.tsx`, all files in `src/components/transfer/` and `src/components/ui/`.

All commands run from: `money-transfer-mvp/frontend/`

---

## Task 1: Add `AccountTransaction` type and extend `api.ts`

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/api.ts`

- [ ] **Step 1.1: Append `AccountTransaction` to `src/types/index.ts`**

Open `src/types/index.ts`. After the last line (`export const COMMISSION_RATE = 0.02;`), append:

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

- [ ] **Step 1.2: Extend `src/lib/api.ts`**

The current `api.ts` imports `Account, ApiResponse, CreateTransferPayload, Transfer` from `@/types`. Update the import to also include `AccountTransaction`, then extend the `api.accounts` object with two new methods.

Replace the import line:
```ts
import { Account, ApiResponse, CreateTransferPayload, Transfer } from '@/types';
```
With:
```ts
import { Account, AccountTransaction, ApiResponse, CreateTransferPayload, Transfer } from '@/types';
```

Then replace the `accounts` block (the closing `},` after `list()`) so it reads:

```ts
  accounts: {
    list(): Promise<ApiResponse<Account[]>> {
      return request<Account[]>('/accounts');
    },
    getById(id: string): Promise<ApiResponse<Account>> {
      return request<Account>(`/accounts/${id}`);
    },
    getTransactions(id: string): Promise<ApiResponse<AccountTransaction[]>> {
      return request<AccountTransaction[]>(`/accounts/${id}/transactions`);
    },
  },
```

- [ ] **Step 1.3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 1.4: Commit**

```bash
git add src/types/index.ts src/lib/api.ts
git commit -m "feat: add AccountTransaction type and extend api.accounts client"
```

---

## Task 2: Create `GET /api/accounts/[id]` route

**Files:**
- Create: `src/app/api/accounts/[id]/route.ts`

- [ ] **Step 2.1: Create the directory and file**

Create `src/app/api/accounts/[id]/route.ts` with this content:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const account = await prisma.account.findUnique({ where: { id } });

    if (!account) {
      return NextResponse.json(
        { success: false, error: { message: 'الحساب غير موجود' } },
        { status: 404 }
      );
    }

    const data = {
      id: account.id,
      accountNumber: account.accountNumber,
      holderName: account.holderName,
      balance: account.balance.toNumber(),
      currency: account.currency,
      createdAt: account.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في جلب الحساب' } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/app/api/accounts/
git commit -m "feat: add GET /api/accounts/[id] route"
```

---

## Task 3: Create `GET /api/accounts/[id]/transactions` route

**Files:**
- Create: `src/app/api/accounts/[id]/transactions/route.ts`

- [ ] **Step 3.1: Create the file**

Create `src/app/api/accounts/[id]/transactions/route.ts` with this content:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const account = await prisma.account.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: { message: 'الحساب غير موجود' } },
        { status: 404 }
      );
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [{ fromAccountId: id }, { toAccountId: id }],
      },
      include: {
        fromAccount: {
          select: { id: true, accountNumber: true, holderName: true },
        },
        toAccount: {
          select: { id: true, accountNumber: true, holderName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = transfers.map((t) => ({
      id: t.id,
      direction: t.fromAccountId === id ? 'outgoing' : 'incoming',
      fromAccount: t.fromAccount,
      toAccount: t.toAccount,
      amount: t.amount.toNumber(),
      commission: t.commission.toNumber(),
      totalAmount: t.totalAmount.toNumber(),
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في جلب حركات الحساب' } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.3: Commit**

```bash
git add src/app/api/accounts/
git commit -m "feat: add GET /api/accounts/[id]/transactions route"
```

---

## Task 4: Create `AccountsTable` component

**Files:**
- Create: `src/components/accounts/AccountsTable.tsx`

- [ ] **Step 4.1: Create the component**

Create `src/components/accounts/AccountsTable.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { Account, Currency, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AccountsTableProps {
  accounts: Account[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  if (accounts.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl border"
        style={{ background: 'hsl(224 44% 9%)', borderColor: 'hsl(221 42% 17%)' }}
      >
        <p className="text-muted-foreground font-medium">لا توجد حسابات مسجلة.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'hsl(221 42% 17%)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              background: 'hsl(223 40% 11%)',
              borderBottom: '1px solid hsl(221 42% 17%)',
            }}
          >
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
              اسم الحامل
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
              رقم الحساب
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
              الرصيد
            </th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
              العملة
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, i) => (
            <tr
              key={account.id}
              style={{
                background:
                  i % 2 === 0 ? 'hsl(224 44% 9%)' : 'hsl(223 42% 10%)',
                borderBottom: '1px solid hsl(221 42% 17%)',
              }}
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {account.holderName}
              </td>
              <td
                className="px-4 py-3 font-mono text-sm text-muted-foreground"
                dir="ltr"
              >
                {account.accountNumber}
              </td>
              <td
                className="px-4 py-3 font-semibold tabular-nums"
                style={{ color: '#c9a84c' }}
              >
                {formatCurrency(account.balance, account.currency as Currency)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                <span className="font-mono text-xs font-bold">
                  {account.currency}
                </span>
                <span className="text-xs mr-1">
                  · {CURRENCY_LABELS[account.currency as Currency]}
                </span>
              </td>
              <td className="px-4 py-3 text-left">
                <Link
                  href={`/accounts/${account.id}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#c9a84c',
                  }}
                >
                  عرض الكشف
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/components/accounts/AccountsTable.tsx
git commit -m "feat: add AccountsTable component"
```

---

## Task 5: Create `AccountSummaryCard` component

**Files:**
- Create: `src/components/accounts/AccountSummaryCard.tsx`

- [ ] **Step 5.1: Create the component**

Create `src/components/accounts/AccountSummaryCard.tsx`:

```tsx
'use client';

import { Account, Currency, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AccountSummaryCardProps {
  account: Account;
}

export function AccountSummaryCard({ account }: AccountSummaryCardProps) {
  return (
    <Card
      className="shadow-xl border"
      style={{
        borderColor: 'hsl(221 42% 17%)',
        background: 'hsl(224 44% 9%)',
      }}
    >
      <CardHeader
        className="border-b pb-4"
        style={{
          borderColor: 'hsl(221 42% 17%)',
          background: 'hsl(223 40% 11%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-base flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
              color: '#0a0f1e',
            }}
          >
            {account.holderName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg leading-none">
              {account.holderName}
            </p>
            <p
              className="text-xs text-muted-foreground mt-1 font-mono"
              dir="ltr"
            >
              {account.accountNumber}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">الرصيد الحالي</p>
            <p
              className="text-3xl font-extrabold tabular-nums"
              style={{ color: '#c9a84c' }}
            >
              {formatCurrency(account.balance, account.currency as Currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">العملة</p>
            <p className="font-semibold text-foreground">
              <span className="font-mono text-sm">{account.currency}</span>
              <span className="text-xs text-muted-foreground mr-1">
                · {CURRENCY_LABELS[account.currency as Currency]}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add src/components/accounts/AccountSummaryCard.tsx
git commit -m "feat: add AccountSummaryCard component"
```

---

## Task 6: Create `AccountTransactionsTable` component

**Files:**
- Create: `src/components/accounts/AccountTransactionsTable.tsx`

- [ ] **Step 6.1: Create the component**

Create `src/components/accounts/AccountTransactionsTable.tsx`:

```tsx
'use client';

import { AccountTransaction, Currency, TransferStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AccountTransactionsTableProps {
  transactions: AccountTransaction[];
}

const DIRECTION_STYLES = {
  outgoing: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    label: 'صادر',
  },
  incoming: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#4ade80',
    label: 'وارد',
  },
} as const;

const STATUS_STYLES: Record<
  TransferStatus,
  { background: string; border: string; color: string; label: string }
> = {
  COMPLETED: {
    background: 'rgba(201,168,76,0.1)',
    border: '1px solid rgba(201,168,76,0.3)',
    color: '#c9a84c',
    label: 'مكتمل',
  },
  PENDING: {
    background: 'rgba(234,179,8,0.1)',
    border: '1px solid rgba(234,179,8,0.3)',
    color: '#facc15',
    label: 'معلق',
  },
  FAILED: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    label: 'فاشل',
  },
};

interface BadgeStyleProps {
  background: string;
  border: string;
  color: string;
  label: string;
}

function Badge({ style }: { style: BadgeStyleProps }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        background: style.background,
        border: style.border,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccountTransactionsTable({
  transactions,
}: AccountTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl border"
        style={{
          background: 'hsl(224 44% 9%)',
          borderColor: 'hsl(221 42% 17%)',
        }}
      >
        <p className="text-muted-foreground font-medium">
          لا توجد حركات على هذا الحساب.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'hsl(221 42% 17%)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr
              style={{
                background: 'hsl(223 40% 11%)',
                borderBottom: '1px solid hsl(221 42% 17%)',
              }}
            >
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                الاتجاه
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                رقم العملية
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                المُرسِل
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                المُستلم
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                المبلغ
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                العمولة
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                الإجمالي
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                العملة
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                الحالة
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={tx.id}
                style={{
                  background:
                    i % 2 === 0
                      ? 'hsl(224 44% 9%)'
                      : 'hsl(223 42% 10%)',
                  borderBottom: '1px solid hsl(221 42% 17%)',
                }}
              >
                <td className="px-4 py-3">
                  <Badge style={DIRECTION_STYLES[tx.direction]} />
                </td>
                <td
                  className="px-4 py-3 font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {tx.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-foreground">
                  <div className="font-medium whitespace-nowrap">
                    {tx.fromAccount.holderName}
                  </div>
                  <div
                    className="text-xs text-muted-foreground font-mono"
                    dir="ltr"
                  >
                    {tx.fromAccount.accountNumber}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">
                  <div className="font-medium whitespace-nowrap">
                    {tx.toAccount.holderName}
                  </div>
                  <div
                    className="text-xs text-muted-foreground font-mono"
                    dir="ltr"
                  >
                    {tx.toAccount.accountNumber}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums font-medium text-foreground whitespace-nowrap">
                  {formatCurrency(tx.amount, tx.currency as Currency)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground whitespace-nowrap">
                  {formatCurrency(tx.commission, tx.currency as Currency)}
                </td>
                <td
                  className="px-4 py-3 tabular-nums font-semibold whitespace-nowrap"
                  style={{ color: '#c9a84c' }}
                >
                  {formatCurrency(tx.totalAmount, tx.currency as Currency)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {tx.currency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge style={STATUS_STYLES[tx.status]} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(tx.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6.3: Commit**

```bash
git add src/components/accounts/AccountTransactionsTable.tsx
git commit -m "feat: add AccountTransactionsTable component"
```

---

## Task 7: Create `/accounts` page

**Files:**
- Create: `src/app/accounts/page.tsx`

- [ ] **Step 7.1: Create the page**

Create `src/app/accounts/page.tsx`:

```tsx
import Link from 'next/link';
import { AccountsTable } from '@/components/accounts/AccountsTable';
import { Account } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
    });
    return accounts.map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      holderName: a.holderName,
      balance: a.balance.toNumber(),
      currency: a.currency as Account['currency'],
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('DB ERROR:', err);
    return [];
  }
}

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                color: '#0a0f1e',
              }}
            >
              ت
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-none">
                نظام التحويلات
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Money Transfer System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/transfer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
              }}
            >
              إجراء تحويل
            </Link>
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                border: '1px solid #c9a84c',
                color: '#c9a84c',
                background: 'rgba(201,168,76,0.08)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full inline-block animate-pulse"
                style={{ background: '#c9a84c' }}
              />
              متصل
            </span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-foreground mb-1">
            الحسابات
          </h2>
          <p className="text-muted-foreground text-sm">
            عرض جميع الحسابات ورصيدها الحالي
          </p>
        </div>
        <AccountsTable accounts={accounts} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 7.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7.3: Commit**

```bash
git add src/app/accounts/page.tsx
git commit -m "feat: add /accounts overview page"
```

---

## Task 8: Create `/accounts/[id]` page

**Files:**
- Create: `src/app/accounts/[id]/page.tsx`

- [ ] **Step 8.1: Create the page**

Create `src/app/accounts/[id]/page.tsx`:

```tsx
import Link from 'next/link';
import { AccountSummaryCard } from '@/components/accounts/AccountSummaryCard';
import { AccountTransactionsTable } from '@/components/accounts/AccountTransactionsTable';
import { Account, AccountTransaction } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AccountStatementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let account: Account | null = null;
  let transactions: AccountTransaction[] = [];

  try {
    const raw = await prisma.account.findUnique({ where: { id } });
    if (raw) {
      account = {
        id: raw.id,
        accountNumber: raw.accountNumber,
        holderName: raw.holderName,
        balance: raw.balance.toNumber(),
        currency: raw.currency as Account['currency'],
        createdAt: raw.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.error('DB ERROR (account):', err);
  }

  if (account) {
    try {
      const rawTransfers = await prisma.transfer.findMany({
        where: {
          OR: [{ fromAccountId: id }, { toAccountId: id }],
        },
        include: {
          fromAccount: {
            select: { id: true, accountNumber: true, holderName: true },
          },
          toAccount: {
            select: { id: true, accountNumber: true, holderName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      transactions = rawTransfers.map((t) => ({
        id: t.id,
        direction: (t.fromAccountId === id ? 'outgoing' : 'incoming') as
          | 'outgoing'
          | 'incoming',
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
        amount: t.amount.toNumber(),
        commission: t.commission.toNumber(),
        totalAmount: t.totalAmount.toNumber(),
        currency: t.currency as AccountTransaction['currency'],
        status: t.status as AccountTransaction['status'],
        createdAt: t.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('DB ERROR (transactions):', err);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                color: '#0a0f1e',
              }}
            >
              ت
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-none">
                نظام التحويلات
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Money Transfer System
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              border: '1px solid #c9a84c',
              color: '#c9a84c',
              background: 'rgba(201,168,76,0.08)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full inline-block animate-pulse"
              style={{ background: '#c9a84c' }}
            />
            متصل
          </span>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Back Link */}
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← الحسابات
        </Link>

        {!account ? (
          <div
            className="text-center py-16 rounded-xl border"
            style={{
              background: 'hsl(224 44% 9%)',
              borderColor: 'hsl(221 42% 17%)',
            }}
          >
            <p className="text-muted-foreground font-medium text-lg">
              الحساب غير موجود
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              لم يتم العثور على حساب بهذا المعرّف.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">
                كشف الحساب
              </h2>
              <p className="text-muted-foreground text-sm">
                سجل الحركات الكاملة للحساب
              </p>
            </div>

            <AccountSummaryCard account={account} />

            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                الحركات
              </h3>
              <AccountTransactionsTable transactions={transactions} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 8.2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8.3: Commit**

```bash
git add src/app/accounts/
git commit -m "feat: add /accounts/[id] account statement page"
```

---

## Task 9: Build verification and final checks

- [ ] **Step 9.1: Run full production build**

```bash
npm run build
```

Expected output includes:
- `✓ Compiled successfully`
- Routes listed: `/accounts`, `/accounts/[id]`, `/api/accounts/[id]`, `/api/accounts/[id]/transactions`
- Zero TypeScript errors
- Zero Prisma errors

If build fails: read the error output carefully. TypeScript errors will point to a specific file and line. Fix only the reported issue — do not refactor surrounding code.

- [ ] **Step 9.2: Start dev server and verify existing transfer flow**

```bash
npm run dev
```

Navigate to `http://localhost:3000`:
- [ ] Redirects to `/transfer` ✓
- [ ] Transfer form loads with accounts ✓
- [ ] Can complete a transfer end-to-end ✓ (balance changes)

- [ ] **Step 9.3: Verify new accounts pages**

Navigate to `http://localhost:3000/accounts`:
- [ ] Lists all accounts with holder name, account number, balance, currency
- [ ] Balances show in formatted Arabic currency (e.g., `١٢٬٥٠٠٫٠٠ ر.س.`)
- [ ] "عرض الكشف" button for each account
- [ ] "إجراء تحويل" link in header navigates to `/transfer`

Navigate to `http://localhost:3000/accounts/<any-valid-account-id>`:
- [ ] Shows account summary card with name, account number, balance
- [ ] Shows transactions table sorted newest first
- [ ] Direction badges: صادر (red) for outgoing, وارد (green) for incoming
- [ ] Status badge: مكتمل (gold) for completed transfers
- [ ] "← الحسابات" back link navigates to `/accounts`

Navigate to `http://localhost:3000/accounts/nonexistent-id`:
- [ ] Shows Arabic "الحساب غير موجود" message (not a crash)

- [ ] **Step 9.4: Verify new API routes**

```bash
# Replace ACCOUNT_ID with a real account ID from your database
curl http://localhost:3000/api/accounts/ACCOUNT_ID
```
Expected: `{"success":true,"data":{...}}`

```bash
curl http://localhost:3000/api/accounts/ACCOUNT_ID/transactions
```
Expected: `{"success":true,"data":[...]}` with `direction` field on each item

```bash
curl http://localhost:3000/api/accounts/fake-id
```
Expected: `{"success":false,"error":{"message":"الحساب غير موجود"}}` with status 404

- [ ] **Step 9.5: Final commit**

```bash
git add .
git status  # confirm only expected files
git commit -m "feat: accounts overview and statement screens complete"
```

- [ ] **Step 9.6: Push to main (triggers Vercel deploy)**

Only push after all above checks pass:

```bash
git push origin main
```

Monitor Vercel dashboard for successful deployment. Verify live URL has both `/accounts` and `/accounts/:id` working.

---

## Spec Coverage Checklist

| Spec Requirement | Task |
|---|---|
| GET /api/accounts/[id] | Task 2 |
| GET /api/accounts/[id]/transactions | Task 3 |
| direction computed server-side | Task 3, Task 8 |
| AccountTransaction type | Task 1 |
| api.ts extensions | Task 1 |
| AccountsTable component | Task 4 |
| AccountSummaryCard component | Task 5 |
| AccountTransactionsTable component | Task 6 |
| /accounts page, direct Prisma | Task 7 |
| /accounts/[id] page, direct Prisma | Task 8 |
| per-page headers (no shared layout) | Tasks 7, 8 |
| Arabic RTL text, correct labels | Tasks 4–8 |
| direction badges صادر/وارد | Task 6 |
| status badges مكتمل/معلق/فاشل | Task 6 |
| empty states | Tasks 4, 6 |
| 404 handling for unknown account | Task 8 |
| no schema changes | all tasks |
| no existing files broken | all tasks |
| build passes | Task 9 |
