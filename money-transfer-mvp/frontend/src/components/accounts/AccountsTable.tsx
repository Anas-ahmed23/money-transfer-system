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
