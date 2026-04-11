# Phase 4 UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Money Transfer System to a professional light theme, enforce English numerals everywhere, add a shared navbar, add account search/filter, and enforce same-currency-only transfers — with zero schema changes and zero breaking changes to existing functionality.

**Architecture:** All theme changes flow through a single CSS variable swap in `globals.css`. A shared `<Navbar />` client component is inserted in `layout.tsx` once, replacing five copy-pasted headers. Currency enforcement is handled both in the frontend form (auto-detect + disable selector + inline validation) and in the backend service (guard on `createTransfer`). Search/filter is purely client-side via `useMemo` in a thin wrapper component.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (CSS variable tokens), shadcn/ui, Prisma, Express backend (TypeScript)

---

## File Map

| File | Role | Action |
|---|---|---|
| `frontend/src/app/globals.css` | Global CSS variables + base styles | Update `:root` to light theme |
| `frontend/src/lib/utils.ts` | `formatCurrency` — shared number formatter | Fix locale `ar-SA` → `en-US` |
| `frontend/src/components/accounts/AccountTransactionsTable.tsx` | `formatDate` helper | Fix locale `ar-SA` → `en-US` |
| `backend/src/services/transfer.service.ts` | Transfer business logic | Fix error locale + add currency guard |
| `frontend/src/components/layout/Navbar.tsx` | **NEW** — shared sticky header | Create |
| `frontend/src/app/layout.tsx` | Root layout | Add `<Navbar />`, remove font links (move to Navbar) |
| `frontend/src/app/page.tsx` | Home page | Remove `<header>`, clean inline dark styles |
| `frontend/src/app/accounts/page.tsx` | Accounts list page | Remove `<header>`, add Create Account button |
| `frontend/src/app/accounts/create/page.tsx` | Create account form page | Remove `<header>`, clean inline dark styles |
| `frontend/src/app/accounts/[id]/page.tsx` | Account statement page | Remove `<header>`, clean inline dark styles |
| `frontend/src/app/transfer/page.tsx` | Transfer page | Remove `<header>`, clean inline dark styles |
| `frontend/src/components/transfer/TransferForm.tsx` | Transfer form | Currency auto-detect + disable + validation + search inputs |
| `frontend/src/components/accounts/AccountsListSection.tsx` | **NEW** — accounts search/filter wrapper | Create |
| `frontend/src/components/accounts/AccountsTable.tsx` | Accounts table | Clean inline dark styles |
| `frontend/src/components/accounts/AccountSummaryCard.tsx` | Account balance card | Clean inline dark styles |
| `frontend/src/components/transfer/SummaryCard.tsx` | Transfer summary card | Clean inline dark styles |
| `frontend/src/components/transfer/AccountSelect.tsx` | Account dropdown | Clean inline dark styles |

---

## Task 1: Light Theme + English Numerals Foundation

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/lib/utils.ts`

- [ ] **Step 1: Replace dark CSS variables with light theme in `globals.css`**

Replace the entire file with:

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light backgrounds */
    --background: 210 20% 98%;
    --foreground: 222 47% 11%;

    /* Card surfaces */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* Popover (dropdowns) */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Brand gold primary (deepened for light contrast) */
    --primary: 44 54% 45%;
    --primary-foreground: 222 47% 11%;

    /* Elevated surfaces */
    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 11%;

    /* Muted / subtle */
    --muted: 220 14% 96%;
    --muted-foreground: 215 16% 47%;

    /* Accent (same as primary) */
    --accent: 44 54% 45%;
    --accent-foreground: 222 47% 11%;

    /* Destructive */
    --destructive: 0 65% 51%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & inputs */
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 44 54% 45%;

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

@layer utilities {
  /* Gold gradient for primary CTA buttons */
  .btn-gold {
    background: linear-gradient(135deg, #b8932a 0%, #d4a832 60%, #b8932a 100%);
    background-size: 200% auto;
    color: #fff;
    transition: background-position 0.4s ease, box-shadow 0.2s ease;
  }

  .btn-gold:hover:not(:disabled) {
    background-position: right center;
    box-shadow: 0 4px 20px rgba(184, 147, 42, 0.35);
  }

  .btn-gold:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

- [ ] **Step 2: Fix `formatCurrency` locale in `lib/utils.ts`**

Replace the full `utils.ts` content:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/app/globals.css frontend/src/lib/utils.ts
git commit -m "feat: convert to light theme and fix English numerals in formatCurrency"
```

---

## Task 2: Fix Remaining Locale Issues

**Files:**
- Modify: `frontend/src/components/accounts/AccountTransactionsTable.tsx` (line 72)
- Modify: `backend/src/services/transfer.service.ts` (line 91)

- [ ] **Step 1: Fix `formatDate` in `AccountTransactionsTable.tsx`**

Find this function (around line 71):
```typescript
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

Replace with:
```typescript
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

- [ ] **Step 2: Fix backend error message locale in `transfer.service.ts`**

Find this line (around line 91):
```typescript
`الرصيد غير كافٍ. الرصيد المتاح: ${fromAccount.balance.toNumber().toLocaleString('ar-SA')} ${fromAccount.currency}`,
```

Replace with:
```typescript
`الرصيد غير كافٍ. الرصيد المتاح: ${fromAccount.balance.toNumber().toLocaleString('en-US')} ${fromAccount.currency}`,
```

- [ ] **Step 3: Verify TypeScript compiles on both ends**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
cd ../backend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/components/accounts/AccountTransactionsTable.tsx
git add backend/src/services/transfer.service.ts
git commit -m "fix: use en-US locale for formatDate and backend error message numerals"
```

---

## Task 3: Create Shared Navbar Component

**Files:**
- Create: `frontend/src/components/layout/Navbar.tsx`

- [ ] **Step 1: Create `frontend/src/components/layout/Navbar.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/accounts', label: 'الحسابات' },
  { href: '/transfer', label: 'تحويل' },
];

export function Navbar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, #b8932a, #d4a832)',
              color: '#fff',
            }}
          >
            ت
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-foreground text-base leading-none">نظام التحويلات</p>
            <p className="text-xs text-muted-foreground mt-0.5">Money Transfer System</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Status Indicator */}
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border border-primary/30 text-primary bg-primary/8 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full inline-block animate-pulse bg-primary" />
          متصل
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/components/layout/Navbar.tsx
git commit -m "feat: add shared Navbar component with active link detection"
```

---

## Task 4: Wire Navbar into Layout and Remove All Per-Page Headers

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/accounts/page.tsx`
- Modify: `frontend/src/app/accounts/create/page.tsx`
- Modify: `frontend/src/app/accounts/[id]/page.tsx`
- Modify: `frontend/src/app/transfer/page.tsx`

- [ ] **Step 1: Update `layout.tsx` to include Navbar**

Replace the full file:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'نظام تحويل الأموال',
  description: 'منصة آمنة وسريعة لتحويل الأموال بين الحسابات',
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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx` — remove header, clean inline dark styles**

Replace the full file:

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
        <h2 className="text-3xl font-extrabold text-foreground mb-3">
          نظام التحويلات
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          إدارة الحسابات والتحويلات ومتابعة الحركة المالية بسهولة
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Transfer */}
          <Link
            href="/transfer"
            className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg text-xl bg-primary/10 border border-primary/20">
              ↔
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">إجراء تحويل</p>
              <p className="text-sm text-muted-foreground">تحويل الأموال بين الحسابات</p>
            </div>
            <span className="mt-auto text-xs font-semibold text-primary">الانتقال →</span>
          </Link>

          {/* Accounts */}
          <Link
            href="/accounts"
            className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg text-xl bg-primary/10 border border-primary/20">
              ☰
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">عرض الحسابات</p>
              <p className="text-sm text-muted-foreground">قائمة الحسابات وأرصدتها</p>
            </div>
            <span className="mt-auto text-xs font-semibold text-primary">الانتقال →</span>
          </Link>

          {/* Create Account */}
          <Link
            href="/accounts/create"
            className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg text-xl bg-primary/10 border border-primary/20">
              +
            </div>
            <div>
              <p className="font-bold text-foreground text-base mb-1">إنشاء حساب جديد</p>
              <p className="text-sm text-muted-foreground">إضافة حساب للنظام</p>
            </div>
            <span className="mt-auto text-xs font-semibold text-primary">الانتقال →</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
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

- [ ] **Step 3: Update `app/accounts/page.tsx` — remove header, add Create Account button**

Replace the full file:

```typescript
import Link from 'next/link';
import { AccountsListSection } from '@/components/accounts/AccountsListSection';
import { Account } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
      take: 500,
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground mb-1">الحسابات</h2>
            <p className="text-muted-foreground text-sm">عرض جميع الحسابات ورصيدها الحالي</p>
          </div>
          <Link
            href="/accounts/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-gold"
          >
            + إنشاء حساب
          </Link>
        </div>
        <AccountsListSection accounts={accounts} />
      </div>

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

- [ ] **Step 4: Update `app/accounts/create/page.tsx` — remove header, clean inline dark styles**

Replace the full file:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CURRENCIES = [
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' },
  { value: 'GBP', label: 'جنيه إسترليني (GBP)' },
  { value: 'AED', label: 'درهم إماراتي (AED)' },
];

export default function CreateAccountPage() {
  const router = useRouter();

  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const parsedBalance = parseFloat(balance);
    if (!balance || isNaN(parsedBalance)) {
      setError('يرجى إدخال رصيد افتتاحي صحيح');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderName,
          accountNumber,
          balance: parsedBalance,
          currency,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'فشل في إنشاء الحساب');
        return;
      }

      router.push('/accounts');
    } catch {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          ← الحسابات
        </Link>

        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-foreground mb-1">إنشاء حساب جديد</h2>
            <p className="text-sm text-muted-foreground">أدخل بيانات الحساب لإضافته إلى النظام</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Holder Name */}
              <div>
                <label htmlFor="holderName" className="block text-sm font-semibold text-foreground mb-1.5">
                  اسم الحامل
                </label>
                <input
                  id="holderName"
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-semibold text-foreground mb-1.5">
                  رقم الحساب
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="مثال: ACC-001"
                  required
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 text-right"
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label htmlFor="balance" className="block text-sm font-semibold text-foreground mb-1.5">
                  الرصيد الافتتاحي
                </label>
                <input
                  id="balance"
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 text-right"
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-foreground mb-1.5">
                  العملة
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg px-4 py-3 text-sm font-medium bg-destructive/10 border border-destructive/30 text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-bold btn-gold"
              >
                {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </form>
          </div>
        </div>
      </div>

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

- [ ] **Step 5: Update `app/accounts/[id]/page.tsx` — remove header, clean inline dark styles**

Replace the full file:

```typescript
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
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← الحسابات
        </Link>

        {!account ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <p className="text-foreground font-medium text-lg">الحساب غير موجود</p>
            <p className="text-sm text-muted-foreground mt-2">لم يتم العثور على حساب بهذا المعرّف.</p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">كشف الحساب</h2>
              <p className="text-muted-foreground text-sm">سجل الحركات الكاملة للحساب</p>
            </div>

            <AccountSummaryCard account={account} />

            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">الحركات</h3>
              <AccountTransactionsTable transactions={transactions} />
            </div>
          </>
        )}
      </div>

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

- [ ] **Step 6: Update `app/transfer/page.tsx` — remove header, clean inline dark styles**

Replace the full file:

```typescript
import { TransferForm } from '@/components/transfer/TransferForm';
import { Account } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
      take: 500,
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

export default async function TransferPage() {
  const accounts = await getAccounts();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">تحويل الأموال</h2>
            <p className="text-muted-foreground">حوّل الأموال بين الحسابات بأمان وسرعة</p>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border bg-card">
              <p className="text-muted-foreground font-medium">
                تعذر تحميل الحسابات. يرجى المحاولة مرة أخرى لاحقاً.
              </p>
            </div>
          ) : (
            <TransferForm accounts={accounts} />
          )}
        </div>
      </div>

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

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/app/layout.tsx
git add frontend/src/app/page.tsx
git add frontend/src/app/accounts/page.tsx
git add frontend/src/app/accounts/create/page.tsx
git add "frontend/src/app/accounts/[id]/page.tsx"
git add frontend/src/app/transfer/page.tsx
git commit -m "feat: add Navbar to layout, remove per-page headers, light theme page cleanup"
```

---

## Task 5: Backend — Same-Currency Transfer Validation

**Files:**
- Modify: `backend/src/services/transfer.service.ts`

- [ ] **Step 1: Add currency match guards in `createTransfer`**

In `transfer.service.ts`, after the two `findUnique` calls and null checks (around line 83), add the currency validation block. The section currently reads:

```typescript
    const commission = parseFloat((amount * COMMISSION_RATE).toFixed(2));
```

Insert before that line:

```typescript
    if (fromAccount.currency !== currency) {
      throw new AppError(
        `عملة حساب المصدر هي ${fromAccount.currency}. لا يمكن إجراء تحويل بعملة ${currency}.`,
        400,
        'CURRENCY_MISMATCH'
      );
    }

    if (toAccount.currency !== currency) {
      throw new AppError(
        `عملة حساب الوجهة هي ${toAccount.currency}. التحويل يجب أن يكون بنفس عملة الحسابين.`,
        400,
        'CURRENCY_MISMATCH'
      );
    }

    const commission = parseFloat((amount * COMMISSION_RATE).toFixed(2));
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/backend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd money-transfer-mvp
git add backend/src/services/transfer.service.ts
git commit -m "feat: add same-currency enforcement in TransferService"
```

---

## Task 6: TransferForm — Currency Auto-Detect + Validation + Account Search

**Files:**
- Modify: `frontend/src/components/transfer/TransferForm.tsx`

- [ ] **Step 1: Replace full `TransferForm.tsx`**

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TransferFormProps {
  accounts: Account[];
}

type FormErrors = Partial<Record<keyof TransferFormValues, string>>;

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
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');

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

  const filteredFromAccounts = useMemo(() => {
    if (!fromSearch.trim()) return accounts;
    const q = fromSearch.toLowerCase();
    return accounts.filter(
      (a) =>
        a.holderName.toLowerCase().includes(q) ||
        a.accountNumber.toLowerCase().includes(q)
    );
  }, [accounts, fromSearch]);

  const filteredToAccounts = useMemo(() => {
    const base = values.fromAccountId
      ? accounts.filter((a) => a.id !== values.fromAccountId)
      : accounts;
    if (!toSearch.trim()) return base;
    const q = toSearch.toLowerCase();
    return base.filter(
      (a) =>
        a.holderName.toLowerCase().includes(q) ||
        a.accountNumber.toLowerCase().includes(q)
    );
  }, [accounts, values.fromAccountId, toSearch]);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (!values.fromAccountId) errs.fromAccountId = 'يرجى اختيار حساب المصدر';
    if (!values.toAccountId) errs.toAccountId = 'يرجى اختيار حساب الوجهة';

    if (
      values.fromAccountId &&
      values.toAccountId &&
      values.fromAccountId === values.toAccountId
    ) {
      errs.toAccountId = 'لا يمكن التحويل إلى نفس الحساب';
    }

    if (values.fromAccountId && values.toAccountId) {
      const toAcct = accounts.find((a) => a.id === values.toAccountId);
      if (fromAccount && toAcct && fromAccount.currency !== toAcct.currency) {
        errs.toAccountId = `حساب الوجهة بعملة ${toAcct.currency} لا يتطابق مع عملة حساب المصدر (${fromAccount.currency}). التحويل يجب أن يكون بنفس العملة.`;
      }
    }

    const amount = parseFloat(values.amount);
    if (!values.amount || isNaN(amount)) {
      errs.amount = 'يرجى إدخال مبلغ صحيح';
    } else if (amount <= 0) {
      errs.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    } else if (fromAccount && summary && fromAccount.balance < summary.totalAmount) {
      errs.amount = `الرصيد غير كافٍ. الرصيد المتاح: ${formatCurrency(
        fromAccount.balance,
        fromAccount.currency as Currency
      )}`;
    }

    return errs;
  }, [values, fromAccount, summary, accounts]);

  const handleFieldChange = useCallback(
    (field: keyof TransferFormValues, value: string) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-set currency to match fromAccount currency
        if (field === 'fromAccountId' && value) {
          const acct = accounts.find((a) => a.id === value);
          if (acct) next.currency = acct.currency as Currency;
        }
        return next;
      });
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setApiError(null);
      setSuccessMessage(null);
    },
    [errors, accounts]
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
        `تم التحويل بنجاح! رقم العملية: ${transfer.id.slice(0, 8).toUpperCase()}`
      );
      setValues(INITIAL_VALUES);
      setErrors({});
      setFromSearch('');
      setToSearch('');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'حدث خطأ أثناء تنفيذ التحويل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="shadow-md border border-border bg-card">
        {/* Card Header */}
        <CardHeader className="border-b border-border pb-5 bg-secondary rounded-t-xl">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#fff' }}
            >
              ↗
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">تحويل الأموال</CardTitle>
              <CardDescription className="text-muted-foreground">
                أدخل تفاصيل التحويل بين الحسابات
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="rounded-xl p-4 flex items-start gap-3 bg-primary/10 border border-primary/30">
              <span className="text-primary text-lg">✓</span>
              <p className="font-semibold text-sm text-primary">{successMessage}</p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4">
              <p className="text-destructive font-medium text-sm">{apiError}</p>
            </div>
          )}

          {/* From Account Search + Select */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">بحث في حسابات المصدر</Label>
            <Input
              type="text"
              placeholder="ابحث بالاسم أو رقم الحساب..."
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              className="h-10"
            />
            <AccountSelect
              label="من حساب"
              accounts={filteredFromAccounts}
              value={values.fromAccountId}
              onValueChange={(v) => handleFieldChange('fromAccountId', v)}
            />
            {errors.fromAccountId && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.fromAccountId}</p>
            )}
            {fromAccount && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                الرصيد المتاح:{' '}
                <span className="font-semibold text-primary">
                  {formatCurrency(fromAccount.balance, fromAccount.currency as Currency)}
                </span>
                <span className="mr-2 text-muted-foreground">
                  · العملة: <span className="font-mono font-bold">{fromAccount.currency}</span>
                </span>
              </p>
            )}
          </div>

          {/* Transfer Direction Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#fff' }}
            >
              ↓
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* To Account Search + Select */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">بحث في حسابات الوجهة</Label>
            <Input
              type="text"
              placeholder="ابحث بالاسم أو رقم الحساب..."
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
              className="h-10"
            />
            <AccountSelect
              label="إلى حساب"
              accounts={filteredToAccounts}
              value={values.toAccountId}
              excludeId={values.fromAccountId}
              onValueChange={(v) => handleFieldChange('toAccountId', v)}
            />
            {errors.toAccountId && (
              <p className="mt-1.5 text-xs text-destructive font-medium">{errors.toAccountId}</p>
            )}
          </div>

          {/* Amount + Currency (currency locked to fromAccount) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-foreground">المبلغ</Label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={values.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                className={`h-12 text-left tabular-nums text-base ${
                  errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
                dir="ltr"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-destructive font-medium">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">العملة</Label>
              <div className="h-12 flex items-center justify-center rounded-lg border border-border bg-muted px-3 text-sm font-mono font-bold text-foreground">
                {values.currency}
              </div>
              {fromAccount && (
                <p className="text-xs text-muted-foreground text-center">
                  {CURRENCY_LABELS[values.currency as Currency]}
                </p>
              )}
              {!fromAccount && (
                <p className="text-xs text-muted-foreground text-center">اختر حساب المصدر أولاً</p>
              )}
            </div>
          </div>

          {/* Commission */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
              العمولة: 2٪
            </span>
            {summary && (
              <span className="text-xs text-muted-foreground">
                = {formatCurrency(summary.commission, summary.currency)}
              </span>
            )}
          </div>

          {/* Summary Card */}
          <SummaryCard summary={summary} />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin" style={{ fontSize: '16px' }}>⟳</span>
                جاري التنفيذ...
              </span>
            ) : (
              'تنفيذ التحويل'
            )}
          </button>
        </CardContent>
      </Card>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/components/transfer/TransferForm.tsx
git commit -m "feat: currency auto-detect, same-currency validation, and account search in TransferForm"
```

---

## Task 7: Create AccountsListSection — Accounts Search + Filter

**Files:**
- Create: `frontend/src/components/accounts/AccountsListSection.tsx`

Note: `accounts/page.tsx` already imports and uses `AccountsListSection` from Task 4 Step 3.

- [ ] **Step 1: Create `AccountsListSection.tsx`**

```typescript
'use client';

import { useState, useMemo } from 'react';
import { Account, Currency, CURRENCY_LABELS } from '@/types';
import { AccountsTable } from './AccountsTable';

const ALL = 'ALL' as const;
type CurrencyFilter = Currency | typeof ALL;

interface AccountsListSectionProps {
  accounts: Account[];
}

export function AccountsListSection({ accounts }: AccountsListSectionProps) {
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>(ALL);

  const availableCurrencies = useMemo(() => {
    const seen = new Set<Currency>();
    accounts.forEach((a) => seen.add(a.currency));
    return Array.from(seen).sort() as Currency[];
  }, [accounts]);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        a.holderName.toLowerCase().includes(q) ||
        a.accountNumber.toLowerCase().includes(q);
      const matchesCurrency =
        currencyFilter === ALL || a.currency === currencyFilter;
      return matchesSearch && matchesCurrency;
    });
  }, [accounts, search, currencyFilter]);

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="بحث بالاسم أو رقم الحساب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value as CurrencyFilter)}
          className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value={ALL}>جميع العملات</option>
          {availableCurrencies.map((c) => (
            <option key={c} value={c}>
              {c} · {CURRENCY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Results count hint when filtering */}
      {(search.trim() || currencyFilter !== ALL) && (
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? 'لا توجد نتائج مطابقة'
            : `${filtered.length} حساب من أصل ${accounts.length}`}
        </p>
      )}

      {/* Table or no-results state */}
      {filtered.length === 0 && (search.trim() || currencyFilter !== ALL) ? (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <p className="text-muted-foreground font-medium">لا توجد حسابات تطابق البحث.</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setCurrencyFilter(ALL); }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            مسح الفلاتر
          </button>
        </div>
      ) : (
        <AccountsTable accounts={filtered} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/components/accounts/AccountsListSection.tsx
git commit -m "feat: add AccountsListSection with search and currency filter"
```

---

## Task 8: Component Light Theme Cleanup

**Files:**
- Modify: `frontend/src/components/accounts/AccountsTable.tsx`
- Modify: `frontend/src/components/accounts/AccountSummaryCard.tsx`
- Modify: `frontend/src/components/transfer/SummaryCard.tsx`
- Modify: `frontend/src/components/transfer/AccountSelect.tsx`

- [ ] **Step 1: Replace `AccountsTable.tsx` with light-theme version**

```typescript
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
      <div className="text-center py-12 rounded-xl border border-border bg-card">
        <p className="text-muted-foreground font-medium">لا توجد حسابات مسجلة.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary border-b border-border">
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">اسم الحامل</th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">رقم الحساب</th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">الرصيد</th>
            <th className="text-right px-4 py-3 font-semibold text-muted-foreground">العملة</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, i) => (
            <tr
              key={account.id}
              className={`border-b border-border transition-colors hover:bg-secondary/50 ${
                i % 2 === 0 ? 'bg-card' : 'bg-secondary/30'
              }`}
            >
              <td className="px-4 py-3 font-medium text-foreground">{account.holderName}</td>
              <td className="px-4 py-3 font-mono text-sm text-muted-foreground" dir="ltr">
                {account.accountNumber}
              </td>
              <td className="px-4 py-3 font-semibold tabular-nums text-primary">
                {formatCurrency(account.balance, account.currency as Currency)}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs font-bold text-foreground">
                  {account.currency}
                </span>
                <span className="text-xs text-muted-foreground mr-1">
                  · {CURRENCY_LABELS[account.currency as Currency]}
                </span>
              </td>
              <td className="px-4 py-3 text-left">
                <Link
                  href={`/accounts/${account.id}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
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

- [ ] **Step 2: Replace `AccountSummaryCard.tsx` with light-theme version**

```typescript
'use client';

import { Account, Currency, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AccountSummaryCardProps {
  account: Account;
}

export function AccountSummaryCard({ account }: AccountSummaryCardProps) {
  return (
    <Card className="shadow-sm border border-border bg-card">
      <CardHeader className="border-b border-border pb-4 bg-secondary rounded-t-xl">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-base flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: '#fff' }}
          >
            {account.holderName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-foreground text-lg leading-none">{account.holderName}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono" dir="ltr">
              {account.accountNumber}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">الرصيد الحالي</p>
            <p className="text-3xl font-extrabold tabular-nums text-primary">
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

- [ ] **Step 3: Replace `SummaryCard.tsx` with light-theme version**

```typescript
import { TransferSummary, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SummaryCardProps {
  summary: TransferSummary | null;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary || summary.amount <= 0) {
    return (
      <div className="rounded-xl border border-dashed border-border flex items-center justify-center py-8 bg-secondary/30">
        <p className="text-sm text-muted-foreground">أدخل مبلغ التحويل لعرض الملخص</p>
      </div>
    );
  }

  const { amount, commission, totalAmount, currency } = summary;

  return (
    <div className="rounded-xl p-5 space-y-3 bg-secondary border border-primary/15">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="h-5 w-5 rounded-full flex items-center justify-center text-xs bg-primary/15 text-primary">
          ☰
        </div>
        <span className="text-sm font-bold text-primary">ملخص التحويل</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">المبلغ الأصلي</span>
        <span className="font-semibold text-sm text-foreground">
          {formatCurrency(amount, currency)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">العمولة (2٪)</span>
        <span className="font-semibold text-sm text-amber-600">
          + {formatCurrency(commission, currency)}
        </span>
      </div>

      <Separator className="bg-border" />

      <div className="flex items-center justify-between pt-1">
        <span className="font-bold text-foreground">إجمالي المبلغ المخصوم</span>
        <span className="font-bold text-lg text-primary">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground text-center pt-1">
        العملة: {CURRENCY_LABELS[currency]}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Replace `AccountSelect.tsx` with light-theme version**

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
        <SelectTrigger className="h-12 text-right bg-background border-border">
          <SelectValue placeholder="اختر الحساب" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {availableAccounts.length === 0 ? (
            <div className="py-3 text-center text-sm text-muted-foreground">
              لا توجد حسابات مطابقة
            </div>
          ) : (
            availableAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id} className="py-3">
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="font-semibold text-sm text-foreground">{account.holderName}</span>
                  <span className="text-xs text-muted-foreground">
                    {account.accountNumber}
                    {' · '}
                    <span className="text-primary font-medium">
                      {formatCurrency(account.balance, account.currency as Currency)}
                    </span>
                    {' · '}
                    <span className="font-mono">{account.currency}</span>
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
cd money-transfer-mvp
git add frontend/src/components/accounts/AccountsTable.tsx
git add frontend/src/components/accounts/AccountSummaryCard.tsx
git add frontend/src/components/transfer/SummaryCard.tsx
git add frontend/src/components/transfer/AccountSelect.tsx
git commit -m "feat: light theme cleanup across all shared components"
```

---

## Task 9: Final — AccountTransactionsTable Light Theme Cleanup

**Files:**
- Modify: `frontend/src/components/accounts/AccountTransactionsTable.tsx`

- [ ] **Step 1: Replace `AccountTransactionsTable.tsx` with light-theme version**

```typescript
'use client';

import { AccountTransaction, Currency, TransferStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AccountTransactionsTableProps {
  transactions: AccountTransaction[];
}

const DIRECTION_STYLES = {
  outgoing: {
    badge: 'bg-red-50 border border-red-200 text-red-600',
    amount: 'text-red-600',
    label: 'صادر',
  },
  incoming: {
    badge: 'bg-green-50 border border-green-200 text-green-600',
    amount: 'text-green-600',
    label: 'وارد',
  },
} as const;

const STATUS_STYLES: Record<TransferStatus, { className: string; label: string }> = {
  COMPLETED: {
    className: 'bg-primary/10 border border-primary/20 text-primary',
    label: 'مكتمل',
  },
  PENDING: {
    className: 'bg-amber-50 border border-amber-200 text-amber-600',
    label: 'معلق',
  },
  FAILED: {
    className: 'bg-red-50 border border-red-200 text-red-600',
    label: 'فاشل',
  },
};

function DirectionBadge({ direction }: { direction: 'outgoing' | 'incoming' }) {
  const s = DIRECTION_STYLES[direction];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s.badge}`}>
      {s.label}
    </span>
  );
}

function StatusBadge({ status }: { status: TransferStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s.className}`}>
      {s.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AccountTransactionsTable({ transactions }: AccountTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border border-border bg-card">
        <p className="text-muted-foreground font-medium">لا توجد حركات على هذا الحساب.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-secondary border-b border-border">
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">الاتجاه</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">رقم العملية</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">المُرسِل</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">المُستلم</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">المبلغ</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">العمولة</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">الإجمالي</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">العملة</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">الحالة</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={tx.id}
                className={`border-b border-border transition-colors hover:bg-secondary/50 ${
                  i % 2 === 0 ? 'bg-card' : 'bg-secondary/30'
                }`}
              >
                <td className="px-4 py-3">
                  <DirectionBadge direction={tx.direction} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground" dir="ltr">
                  {tx.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-foreground">
                  <div className="font-medium whitespace-nowrap">{tx.fromAccount.holderName}</div>
                  <div className="text-xs text-muted-foreground font-mono" dir="ltr">
                    {tx.fromAccount.accountNumber}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">
                  <div className="font-medium whitespace-nowrap">{tx.toAccount.holderName}</div>
                  <div className="text-xs text-muted-foreground font-mono" dir="ltr">
                    {tx.toAccount.accountNumber}
                  </div>
                </td>
                <td className={`px-4 py-3 tabular-nums font-semibold whitespace-nowrap ${DIRECTION_STYLES[tx.direction].amount}`}>
                  {tx.direction === 'outgoing' ? '−' : '+'}{formatCurrency(tx.amount, tx.currency as Currency)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground whitespace-nowrap">
                  {formatCurrency(tx.commission, tx.currency as Currency)}
                </td>
                <td className={`px-4 py-3 tabular-nums font-semibold whitespace-nowrap ${DIRECTION_STYLES[tx.direction].amount}`}>
                  {formatCurrency(tx.totalAmount, tx.currency as Currency)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {tx.currency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={tx.status} />
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd money-transfer-mvp/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Final commit**

```bash
cd money-transfer-mvp
git add frontend/src/components/accounts/AccountTransactionsTable.tsx
git commit -m "feat: Phase 4 complete — light theme, English numerals, navbar, search, currency enforcement"
```

---

## Self-Review Checklist

- [x] **Light theme**: globals.css variables replaced in Task 1; all hardcoded dark inline styles removed in Tasks 4 and 8
- [x] **English numerals**: `formatCurrency` fixed in Task 1; `formatDate` fixed in Task 2 (and repeated in Task 9); backend error fixed in Task 2
- [x] **Create account button**: accounts page updated in Task 4 Step 3 with prominent button
- [x] **Transfer search**: `fromSearch` + `toSearch` state + `useMemo` filters in Task 6
- [x] **Same-currency frontend**: currency auto-detect in `handleFieldChange`, locked display in Task 6; `toAccount` currency mismatch validation in `validate()`
- [x] **Same-currency backend**: guard in `TransferService.createTransfer` in Task 5
- [x] **Navbar**: Navbar component in Task 3, wired to layout in Task 4
- [x] **Accounts search+filter**: `AccountsListSection` in Task 7; accounts page uses it from Task 4
- [x] **No pagination broken**: `take: 500` added as safeguard; all lists have empty state; "no results" state with clear-filter button in `AccountsListSection`
- [x] **No schema changes**: confirmed — zero migrations
- [x] **Type consistency**: `CurrencyFilter`, `AccountsListSectionProps`, `filteredFromAccounts`, `filteredToAccounts` all consistent across tasks
