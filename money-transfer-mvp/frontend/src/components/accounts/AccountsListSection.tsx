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
