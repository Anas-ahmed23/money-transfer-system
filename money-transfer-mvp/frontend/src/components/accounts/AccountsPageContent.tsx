'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Account } from '@/types';
import { AccountsListSection } from './AccountsListSection';

const CURRENCIES = [
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' },
  { value: 'GBP', label: 'جنيه إسترليني (GBP)' },
  { value: 'AED', label: 'درهم إماراتي (AED)' },
];

const EMPTY_FORM = { holderName: '', accountNumber: '', balance: '', currency: 'SAR' };

interface AccountsPageContentProps {
  accounts: Account[];
}

export function AccountsPageContent({ accounts }: AccountsPageContentProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function openForm() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedBalance = parseFloat(form.balance);
    if (!form.balance || isNaN(parsedBalance) || parsedBalance < 0) {
      setError('يرجى إدخال رصيد افتتاحي صحيح');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderName: form.holderName,
          accountNumber: form.accountNumber,
          balance: parsedBalance,
          currency: form.currency,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'فشل في إنشاء الحساب');
        return;
      }

      closeForm();
      router.refresh();
    } catch {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">الحسابات</h2>
          <p className="text-muted-foreground text-sm">عرض جميع الحسابات ورصيدها الحالي</p>
        </div>
        <button
          type="button"
          onClick={showForm ? closeForm : openForm}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            showForm
              ? 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
              : 'btn-gold'
          }`}
        >
          {showForm ? '✕ إغلاق' : '+ إضافة حساب'}
        </button>
      </div>

      {/* Inline Quick-Add Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-border bg-secondary/50">
            <p className="font-bold text-foreground text-sm">إضافة حساب جديد</p>
            <p className="text-xs text-muted-foreground mt-0.5">أدخل بيانات الحساب لإضافته إلى النظام فوراً</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Holder Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  اسم الحامل
                </label>
                <input
                  type="text"
                  value={form.holderName}
                  onChange={(e) => handleField('holderName', e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  رقم الحساب
                </label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => handleField('accountNumber', e.target.value)}
                  placeholder="مثال: ACC-001"
                  required
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 text-right"
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  الرصيد الافتتاحي
                </label>
                <input
                  type="number"
                  value={form.balance}
                  onChange={(e) => handleField('balance', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 text-right"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  العملة
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => handleField('currency', e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg px-4 py-3 text-sm font-medium bg-destructive/10 border border-destructive/30 text-destructive">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-sm font-bold btn-gold disabled:opacity-60"
              >
                {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <AccountsListSection accounts={accounts} />
    </div>
  );
}
