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
