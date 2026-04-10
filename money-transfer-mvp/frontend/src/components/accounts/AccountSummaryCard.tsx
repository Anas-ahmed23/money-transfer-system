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
