# Account Combobox Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain search input on the Accounts page and the separate search-input + native-select combo on the Transfer form with a unified `AccountCombobox` component that shows a live-filtered dropdown with highlighted match text and keyboard navigation.

**Architecture:** One new shared component `AccountCombobox` manages its own search state internally, calls `onSelect(account)` on selection, and optionally calls `onSearchChange(q)` on every keystroke so parents can sync their own state (e.g., for table filtering). `AccountsListSection` uses it for quick-jump navigation; `TransferForm` uses it to replace both the text search input and the Shadcn `AccountSelect` for each of its two account fields.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS. No new dependencies required.

---

## File Map

| Action | Path |
|--------|------|
| **Create** | `money-transfer-mvp/frontend/src/components/accounts/AccountCombobox.tsx` |
| **Modify** | `money-transfer-mvp/frontend/src/components/accounts/AccountsListSection.tsx` |
| **Modify** | `money-transfer-mvp/frontend/src/components/transfer/TransferForm.tsx` |

`AccountSelect.tsx` is left untouched (it becomes unused but removing it is out of scope).

---

## Task 1: Create `AccountCombobox` component

**Files:**
- Create: `money-transfer-mvp/frontend/src/components/accounts/AccountCombobox.tsx`

- [ ] **Step 1: Create the file with this exact content**

```tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Account, Currency } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AccountComboboxProps {
  /** Full list of accounts to search (caller applies excludeId filtering before passing) */
  accounts: Account[];
  /** Called when the user selects an account from the dropdown */
  onSelect: (account: Account) => void;
  /** Called when the user clicks ✕ or clears the input — use to reset parent selection state */
  onClear?: () => void;
  /** Currently selected account — controls what's shown in the input after selection */
  selectedAccount?: Account | null;
  /** Optional — syncs the typed search query to the parent on every keystroke */
  onSearchChange?: (q: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Rendered as a <label> above the input */
  label?: string;
}

/** Wraps the matched substring in a gold <span>. Returns a JSX fragment. */
function highlightText(text: string, query: string) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-bold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

export function AccountCombobox({
  accounts,
  onSelect,
  onClear,
  selectedAccount,
  onSearchChange,
  placeholder = 'بحث بالاسم أو رقم الحساب...',
  disabled = false,
  label,
}: AccountComboboxProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // When selectedAccount changes externally (selection made or form reset), sync the input display
  useEffect(() => {
    setSearch(selectedAccount ? selectedAccount.holderName : '');
  }, [selectedAccount]);

  // Close dropdown when user clicks outside the component
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // When the search shows the selected account's name exactly, show all accounts in dropdown.
  // Otherwise filter by the typed query.
  const filteredAccounts = useMemo(() => {
    if (selectedAccount && search === selectedAccount.holderName) return accounts;
    const q = search.toLowerCase().trim();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.holderName.toLowerCase().includes(q) ||
        a.accountNumber.toLowerCase().includes(q)
    );
  }, [accounts, search, selectedAccount]);

  // Only highlight when the user is actively searching (not just displaying a selection)
  const highlightQuery =
    selectedAccount && search === selectedAccount.holderName ? '' : search.trim();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      setOpen(true);
      setActiveIndex(0);
      onSearchChange?.(val);
    },
    [onSearchChange]
  );

  const handleSelect = useCallback(
    (account: Account) => {
      onSelect(account);
      setSearch(account.holderName);
      setOpen(false);
      onSearchChange?.(account.holderName);
    },
    [onSelect, onSearchChange]
  );

  const handleClear = useCallback(() => {
    setSearch('');
    setOpen(false);
    onClear?.();
    onSearchChange?.('');
    inputRef.current?.focus();
  }, [onClear, onSearchChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setOpen(true);
          setActiveIndex(0);
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, filteredAccounts.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredAccounts[activeIndex]) handleSelect(filteredAccounts[activeIndex]);
          break;
        case 'Escape':
        case 'Tab':
          setOpen(false);
          break;
      }
    },
    [open, filteredAccounts, activeIndex, handleSelect]
  );

  // Scroll keyboard-active item into view
  useEffect(() => {
    if (!listRef.current || !open) return;
    const items = listRef.current.querySelectorAll('[data-idx]');
    (items[activeIndex] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
      )}

      {/* Input row */}
      <div className="relative">
        {/* Magnifier icon — right side (RTL) */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none text-sm">
          ⌕
        </span>

        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => { setOpen(true); setActiveIndex(0); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          dir="rtl"
          className={[
            'w-full rounded-lg border bg-background pr-9 pl-8 py-2.5 text-sm text-foreground',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:opacity-60 transition-colors',
            open ? 'border-primary/60' : 'border-border',
          ].join(' ')}
        />

        {/* Clear (✕) button — left side (RTL) */}
        {search && !disabled && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
            tabIndex={-1}
            aria-label="مسح البحث"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Result count header */}
          <div className="px-3 py-1.5 border-b border-border bg-secondary/40 text-right">
            <span className="text-xs text-muted-foreground">
              {filteredAccounts.length === 0
                ? 'لا توجد نتائج مطابقة'
                : `${filteredAccounts.length} حساب`}
            </span>
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">لا توجد نتائج مطابقة</p>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                مسح البحث
              </button>
            </div>
          ) : (
            <ul ref={listRef} className="max-h-60 overflow-y-auto divide-y divide-border/40">
              {filteredAccounts.map((account, i) => {
                const isActive = i === activeIndex;
                const isSelected = selectedAccount?.id === account.id;
                return (
                  <li
                    key={account.id}
                    data-idx={i}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(account); }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={[
                      'flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors',
                      isActive ? 'bg-secondary' : 'hover:bg-secondary/50',
                      isSelected ? 'bg-primary/5' : '',
                    ].join(' ')}
                  >
                    {/* Initials avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm select-none">
                      {account.holderName.charAt(0)}
                    </div>

                    {/* Name + account number */}
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-semibold text-foreground truncate leading-snug">
                        {highlightText(account.holderName, highlightQuery)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">
                        {highlightText(account.accountNumber, highlightQuery)}
                      </p>
                    </div>

                    {/* Balance + currency */}
                    <div className="flex-shrink-0 text-left">
                      <p className="text-xs font-semibold tabular-nums text-primary leading-snug">
                        {formatCurrency(account.balance, account.currency as Currency)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{account.currency}</p>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <span className="flex-shrink-0 text-primary text-sm leading-none">✓</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd money-transfer-mvp/frontend
git add src/components/accounts/AccountCombobox.tsx
git commit -m "feat: add AccountCombobox shared searchable dropdown component"
```

---

## Task 2: Integrate `AccountCombobox` into `AccountsListSection`

**Files:**
- Modify: `money-transfer-mvp/frontend/src/components/accounts/AccountsListSection.tsx`

**What changes:**
- Add `useRouter` import and `AccountCombobox` import
- Replace the plain `<input>` with `<AccountCombobox>`
- `onSelect` → `router.push('/accounts/${account.id}')`
- `onSearchChange` → `setSearch` (keeps table filtering in sync)
- Add `resetKey` state so "مسح الفلاتر" can remount the combobox and clear its internal state
- Pass `key={resetKey}` to `AccountCombobox`

- [ ] **Step 1: Replace the full content of `AccountsListSection.tsx`**

```tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Account, Currency, CURRENCY_LABELS } from '@/types';
import { AccountsTable } from './AccountsTable';
import { AccountCombobox } from './AccountCombobox';

const ALL = 'ALL' as const;
type CurrencyFilter = Currency | typeof ALL;

interface AccountsListSectionProps {
  accounts: Account[];
}

export function AccountsListSection({ accounts }: AccountsListSectionProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>(ALL);
  const [resetKey, setResetKey] = useState(0);

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
      const matchesCurrency = currencyFilter === ALL || a.currency === currencyFilter;
      return matchesSearch && matchesCurrency;
    });
  }, [accounts, search, currencyFilter]);

  function clearFilters() {
    setSearch('');
    setCurrencyFilter(ALL);
    setResetKey((k) => k + 1); // remount combobox to reset its internal search state
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <AccountCombobox
            key={resetKey}
            accounts={accounts}
            onSelect={(account) => router.push(`/accounts/${account.id}`)}
            onSearchChange={setSearch}
            placeholder="بحث بالاسم أو رقم الحساب..."
          />
        </div>
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

      {/* Results count when filtering */}
      {(search.trim() !== '' || currencyFilter !== ALL) && (
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? 'لا توجد نتائج مطابقة'
            : `${filtered.length} حساب من أصل ${accounts.length}`}
        </p>
      )}

      {/* No-results state */}
      {filtered.length === 0 && (search.trim() !== '' || currencyFilter !== ALL) ? (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <p className="text-muted-foreground font-medium">لا توجد حسابات تطابق البحث.</p>
          <button
            type="button"
            onClick={clearFilters}
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

- [ ] **Step 2: Verify the dev server has no TypeScript errors**

```bash
cd money-transfer-mvp/frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/accounts/AccountsListSection.tsx
git commit -m "feat: replace accounts page search input with AccountCombobox"
```

---

## Task 3: Integrate `AccountCombobox` into `TransferForm`

**Files:**
- Modify: `money-transfer-mvp/frontend/src/components/transfer/TransferForm.tsx`

**What changes:**
- Remove `fromSearch`, `toSearch` states (combobox manages search internally)
- Remove `filteredFromAccounts`, `filteredToAccounts` useMemos (combobox filters internally)
- Add `toAccount` useMemo (mirrors the existing `fromAccount`)
- Remove the two Label + Input search rows ("بحث في حسابات المصدر", "بحث في حسابات الوجهة")
- Remove `AccountSelect` import and its two usages
- Import and use `AccountCombobox` for both from/to fields
- `onSelect` for from → `handleFieldChange('fromAccountId', account.id)`
- `onSelect` for to → `handleFieldChange('toAccountId', account.id)`
- `onClear` for from → `handleFieldChange('fromAccountId', '')`
- `onClear` for to → `handleFieldChange('toAccountId', '')`
- On success reset: `INITIAL_VALUES` already clears the IDs → `fromAccount`/`toAccount` become null → comboboxes clear via their internal `useEffect`. Remove the now-unneeded `setFromSearch(''); setToSearch('');` lines.
- For "to" combobox: pass `accounts={accounts.filter((a) => a.id !== values.fromAccountId)}` to exclude the from-account

- [ ] **Step 1: Replace the full content of `TransferForm.tsx`**

```tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Account, TransferFormValues, TransferSummary, Currency, CURRENCY_LABELS } from '@/types';
import { calculateCommission, calculateTotal, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { AccountCombobox } from '@/components/accounts/AccountCombobox';
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

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === values.fromAccountId) ?? null,
    [accounts, values.fromAccountId]
  );

  const toAccount = useMemo(
    () => accounts.find((a) => a.id === values.toAccountId) ?? null,
    [accounts, values.toAccountId]
  );

  const toAccounts = useMemo(
    () => (values.fromAccountId ? accounts.filter((a) => a.id !== values.fromAccountId) : accounts),
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
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: 'hsl(var(--primary-foreground))' }}
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

          {/* From Account */}
          <div className="space-y-2">
            <AccountCombobox
              accounts={accounts}
              onSelect={(account) => handleFieldChange('fromAccountId', account.id)}
              onClear={() => handleFieldChange('fromAccountId', '')}
              selectedAccount={fromAccount}
              label="من حساب"
              placeholder="ابحث باسم الحامل أو رقم الحساب..."
              disabled={isSubmitting}
            />
            {errors.fromAccountId && (
              <p className="text-xs text-destructive font-medium">{errors.fromAccountId}</p>
            )}
            {fromAccount && (
              <p className="text-xs text-muted-foreground">
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
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: 'hsl(var(--primary-foreground))' }}
            >
              ↓
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* To Account */}
          <div className="space-y-2">
            <AccountCombobox
              accounts={toAccounts}
              onSelect={(account) => handleFieldChange('toAccountId', account.id)}
              onClear={() => handleFieldChange('toAccountId', '')}
              selectedAccount={toAccount}
              label="إلى حساب"
              placeholder="ابحث باسم الحامل أو رقم الحساب..."
              disabled={isSubmitting}
            />
            {errors.toAccountId && (
              <p className="text-xs text-destructive font-medium">{errors.toAccountId}</p>
            )}
          </div>

          {/* Amount + Currency (locked to fromAccount currency) */}
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
              {fromAccount ? (
                <p className="text-xs text-muted-foreground text-center">
                  {CURRENCY_LABELS[values.currency as Currency]}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground text-center">اختر حساب المصدر أولاً</p>
              )}
            </div>
          </div>

          {/* Commission Badge */}
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

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd money-transfer-mvp/frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/transfer/TransferForm.tsx
git commit -m "feat: replace transfer form account selects with AccountCombobox"
```

---

## Task 4: Manual verification checklist

Before pushing, verify these golden paths in the browser (run `npm run dev` in `money-transfer-mvp/frontend`):

**Accounts page (`/accounts`):**
- [ ] Search box shows dropdown on focus
- [ ] Typing "أحمد" filters dropdown + highlights "أحمد" in gold in each result
- [ ] Typing also filters the table below
- [ ] Clicking a result navigates to `/accounts/[id]`
- [ ] ✕ button appears when typing; clicking it clears search and table resets
- [ ] Currency filter still works independently
- [ ] "مسح الفلاتر" clears both search and currency filter, combobox input clears too
- [ ] Keyboard: ↓↑ moves selection, Enter navigates, Esc closes dropdown

**Transfer page (`/transfer`):**
- [ ] "من حساب" combobox: type to search, select an account → holderName shown in input, balance shown below, currency locked
- [ ] "إلى حساب" combobox: selected "from" account is excluded from the list
- [ ] Same-currency validation still works (select two accounts with different currencies → error shown)
- [ ] ✕ clears the account selection and resets the field
- [ ] After successful transfer, both comboboxes clear (form resets to INITIAL_VALUES)
- [ ] Keyboard navigation works in both comboboxes

---

## Task 5: Push to GitHub

- [ ] **Step 1: Push**

```bash
cd "C:\Users\User\OneDrive\Documents\money-transfer-system"
git push origin main
```

Expected: branch pushed, no errors.
