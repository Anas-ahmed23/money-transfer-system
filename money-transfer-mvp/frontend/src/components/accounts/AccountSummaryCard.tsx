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
            style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: 'hsl(var(--primary-foreground))' }}
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
