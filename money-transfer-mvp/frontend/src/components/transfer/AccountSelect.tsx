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
        <SelectTrigger className="h-12 text-right">
          <SelectValue placeholder="اختر الحساب" />
        </SelectTrigger>
        <SelectContent>
          {availableAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id} className="py-3">
              <div className="flex flex-col gap-0.5 text-right">
                <span className="font-semibold text-sm">{account.holderName}</span>
                <span className="text-xs text-muted-foreground">
                  {account.accountNumber}
                  {' · '}
                  <span style={{ color: '#c9a84c' }}>
                    {formatCurrency(account.balance, account.currency as Currency)}
                  </span>
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
