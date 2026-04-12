'use client';

import { useState, useCallback, useMemo } from 'react';
import { Account, TransferFormValues, TransferSummary, Currency, CURRENCY_LABELS } from '@/types';
import { calculateCommission, calculateTotal, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { AccountCombobox } from '@/components/accounts/AccountCombobox';
import { SummaryCard } from './SummaryCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TransferFormProps {
  accounts: Account[];
}

type FormErrors = Partial<Record<keyof TransferFormValues, string>>;

const INITIAL_VALUES: TransferFormValues = {
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  currency: 'SAR',
};

export function TransferForm({ accounts }: TransferFormProps) {
  const [values, setValues] = useState<TransferFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === values.fromAccountId) ?? null,
    [accounts, values.fromAccountId]
  );

  const toAccount = useMemo(
    () => accounts.find((a) => a.id === values.toAccountId) ?? null,
    [accounts, values.toAccountId]
  );

  const toAccounts = useMemo(
    () => (values.fromAccountId ? accounts.filter((a) => a.id !== values.fromAccountId) : accounts),
    [accounts, values.fromAccountId]
  );

  const summary = useMemo((): TransferSummary | null => {
    const amount = parseFloat(values.amount);
    if (!values.amount || isNaN(amount) || amount <= 0) return null;
    const commission = calculateCommission(amount);
    const totalAmount = calculateTotal(amount, commission);
    return { amount, commission, totalAmount, currency: values.currency };
  }, [values.amount, values.currency]);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (!values.fromAccountId) errs.fromAccountId = 'يرجى اختيار حساب المصدر';
    if (!values.toAccountId) errs.toAccountId = 'يرجى اختيار حساب الوجهة';

    if (
      values.fromAccountId &&
      values.toAccountId &&
      values.fromAccountId === values.toAccountId
    ) {
      errs.toAccountId = 'لا يمكن التحويل إلى نفس الحساب';
    }

    if (values.fromAccountId && values.toAccountId) {
      const toAcct = accounts.find((a) => a.id === values.toAccountId);
      if (fromAccount && toAcct && fromAccount.currency !== toAcct.currency) {
        errs.toAccountId = `حساب الوجهة بعملة ${toAcct.currency} لا يتطابق مع عملة حساب المصدر (${fromAccount.currency}). التحويل يجب أن يكون بنفس العملة.`;
      }
    }

    const amount = parseFloat(values.amount);
    if (!values.amount || isNaN(amount)) {
      errs.amount = 'يرجى إدخال مبلغ صحيح';
    } else if (amount <= 0) {
      errs.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    } else if (fromAccount && summary && fromAccount.balance < summary.totalAmount) {
      errs.amount = `الرصيد غير كافٍ. الرصيد المتاح: ${formatCurrency(
        fromAccount.balance,
        fromAccount.currency as Currency
      )}`;
    }

    return errs;
  }, [values, fromAccount, summary, accounts]);

  const handleFieldChange = useCallback(
    (field: keyof TransferFormValues, value: string) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (field === 'fromAccountId' && value) {
          const acct = accounts.find((a) => a.id === value);
          if (acct) next.currency = acct.currency as Currency;
        }
        return next;
      });
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setApiError(null);
      setSuccessMessage(null);
    },
    [errors, accounts]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.transfers.create({
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        amount: parseFloat(values.amount),
        currency: values.currency,
      });

      const transfer = response.data;
      setSuccessMessage(
        `تم التحويل بنجاح! رقم العملية: ${transfer.id.slice(0, 8).toUpperCase()}`
      );
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'حدث خطأ أثناء تنفيذ التحويل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="shadow-md border border-border bg-card">
        {/* Card Header */}
        <CardHeader className="border-b border-border pb-5 bg-secondary rounded-t-xl">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: 'hsl(var(--primary-foreground))' }}
            >
              ↗
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">تحويل الأموال</CardTitle>
              <CardDescription className="text-muted-foreground">
                أدخل تفاصيل التحويل بين الحسابات
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="rounded-xl p-4 flex items-start gap-3 bg-primary/10 border border-primary/30">
              <span className="text-primary text-lg">✓</span>
              <p className="font-semibold text-sm text-primary">{successMessage}</p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4">
              <p className="text-destructive font-medium text-sm">{apiError}</p>
            </div>
          )}

          {/* From Account */}
          <div className="space-y-2">
            <AccountCombobox
              accounts={accounts}
              onSelect={(account) => handleFieldChange('fromAccountId', account.id)}
              onClear={() => handleFieldChange('fromAccountId', '')}
              selectedAccount={fromAccount}
              label="من حساب"
              placeholder="ابحث باسم الحامل أو رقم الحساب..."
              disabled={isSubmitting}
            />
            {errors.fromAccountId && (
              <p className="text-xs text-destructive font-medium">{errors.fromAccountId}</p>
            )}
            {fromAccount && (
              <p className="text-xs text-muted-foreground">
                الرصيد المتاح:{' '}
                <span className="font-semibold text-primary">
                  {formatCurrency(fromAccount.balance, fromAccount.currency as Currency)}
                </span>
                <span className="mr-2 text-muted-foreground">
                  · العملة: <span className="font-mono font-bold">{fromAccount.currency}</span>
                </span>
              </p>
            )}
          </div>

          {/* Transfer Direction Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #b8932a, #d4a832)', color: 'hsl(var(--primary-foreground))' }}
            >
              ↓
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* To Account */}
          <div className="space-y-2">
            <AccountCombobox
              accounts={toAccounts}
              onSelect={(account) => handleFieldChange('toAccountId', account.id)}
              onClear={() => handleFieldChange('toAccountId', '')}
              selectedAccount={toAccount}
              label="إلى حساب"
              placeholder="ابحث باسم الحامل أو رقم الحساب..."
              disabled={isSubmitting}
            />
            {errors.toAccountId && (
              <p className="text-xs text-destructive font-medium">{errors.toAccountId}</p>
            )}
          </div>

          {/* Amount + Currency (locked to fromAccount currency) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-foreground">المبلغ</Label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={values.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                className={`h-12 text-left tabular-nums text-base ${
                  errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
                dir="ltr"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-destructive font-medium">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">العملة</Label>
              <div className="h-12 flex items-center justify-center rounded-lg border border-border bg-muted px-3 text-sm font-mono font-bold text-foreground">
                {values.currency}
              </div>
              {fromAccount ? (
                <p className="text-xs text-muted-foreground text-center">
                  {CURRENCY_LABELS[values.currency as Currency]}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground text-center">اختر حساب المصدر أولاً</p>
              )}
            </div>
          </div>

          {/* Commission Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
              العمولة: 2٪
            </span>
            {summary && (
              <span className="text-xs text-muted-foreground">
                = {formatCurrency(summary.commission, summary.currency)}
              </span>
            )}
          </div>

          {/* Summary Card */}
          <SummaryCard summary={summary} />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin" style={{ fontSize: '16px' }}>⟳</span>
                جاري التنفيذ...
              </span>
            ) : (
              'تنفيذ التحويل'
            )}
          </button>
        </CardContent>
      </Card>
    </form>
  );
}
