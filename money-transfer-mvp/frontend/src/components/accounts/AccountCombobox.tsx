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
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none text-base leading-none">
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
