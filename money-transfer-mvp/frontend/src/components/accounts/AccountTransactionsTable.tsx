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
