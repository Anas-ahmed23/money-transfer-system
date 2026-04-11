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
