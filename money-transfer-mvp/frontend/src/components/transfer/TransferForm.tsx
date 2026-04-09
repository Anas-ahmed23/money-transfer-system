'use client';

import { useState, useCallback, useMemo } from 'react';
import { Account, TransferFormValues, TransferSummary, Currency, CURRENCY_LABELS } from '@/types';
import { calculateCommission, calculateTotal, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { AccountSelect } from './AccountSelect';
import { SummaryCard } from './SummaryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TransferFormProps {
  accounts: Account[];
}

type FormErrors = Partial<Record<keyof TransferFormValues, string>>;

const CURRENCIES: Currency[] = ['SAR', 'USD', 'EUR', 'GBP', 'AED'];

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
  }, [values, fromAccount, summary]);

  const handleFieldChange = useCallback(
    (field: keyof TransferFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setApiError(null);
      setSuccessMessage(null);
    },
    [errors]
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
      <Card
        className="shadow-2xl border"
        style={{ borderColor: 'hsl(221 42% 17%)', background: 'hsl(224 44% 9%)' }}
      >
        {/* Card Header */}
        <CardHeader
          className="border-b pb-5"
          style={{ borderColor: 'hsl(221 42% 17%)', background: 'hsl(223 40% 11%)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                color: '#0a0f1e',
              }}
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
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              <span style={{ color: '#f0c040', fontSize: '18px' }}>✓</span>
              <p className="font-semibold text-sm" style={{ color: '#f0c040' }}>
                {successMessage}
              </p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/25 p-4">
              <p className="text-destructive font-medium text-sm">{apiError}</p>
            </div>
          )}

          {/* From Account */}
          <div>
            <AccountSelect
              label="من حساب"
              accounts={accounts}
              value={values.fromAccountId}
              onValueChange={(v) => handleFieldChange('fromAccountId', v)}
            />
            {errors.fromAccountId && (
              <p className="mt-1.5 text-xs text-destructive font-medium">
                {errors.fromAccountId}
              </p>
            )}
            {fromAccount && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                الرصيد المتاح:{' '}
                <span className="font-semibold" style={{ color: '#c9a84c' }}>
                  {formatCurrency(fromAccount.balance, fromAccount.currency as Currency)}
                </span>
              </p>
            )}
          </div>

          {/* Transfer Direction Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'hsl(221 42% 17%)' }} />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                color: '#0a0f1e',
              }}
            >
              ↓
            </div>
            <div className="flex-1 h-px" style={{ background: 'hsl(221 42% 17%)' }} />
          </div>

          {/* To Account */}
          <div>
            <AccountSelect
              label="إلى حساب"
              accounts={accounts}
              value={values.toAccountId}
              excludeId={values.fromAccountId}
              onValueChange={(v) => handleFieldChange('toAccountId', v)}
            />
            {errors.toAccountId && (
              <p className="mt-1.5 text-xs text-destructive font-medium">
                {errors.toAccountId}
              </p>
            )}
          </div>

          {/* Amount + Currency Row */}
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
              <Select
                value={values.currency}
                onValueChange={(v) => handleFieldChange('currency', v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="font-mono font-bold text-xs">{c}</span>
                      <span className="text-xs text-muted-foreground mr-1">
                        · {CURRENCY_LABELS[c]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Commission */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
                color: '#c9a84c',
              }}
            >
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
                <span
                  className="inline-block animate-spin"
                  style={{ fontSize: '16px' }}
                >
                  ⟳
                </span>
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
