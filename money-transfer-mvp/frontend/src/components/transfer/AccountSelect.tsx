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
