'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CURRENCIES = [
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' },
  { value: 'GBP', label: 'جنيه إسترليني (GBP)' },
  { value: 'AED', label: 'درهم إماراتي (AED)' },
];

export default function CreateAccountPage() {
  const router = useRouter();

  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const parsedBalance = parseFloat(balance);
    if (!balance || isNaN(parsedBalance)) {
      setError('يرجى إدخال رصيد افتتاحي صحيح');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderName,
          accountNumber,
          balance: parsedBalance,
          currency,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message ?? 'فشل في إنشاء الحساب');
        return;
      }

      router.push('/accounts');
    } catch {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          ← الحسابات
        </Link>

        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-foreground mb-1">إنشاء حساب جديد</h2>
            <p className="text-sm text-muted-foreground">أدخل بيانات الحساب لإضافته إلى النظام</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Holder Name */}
              <div>
                <label htmlFor="holderName" className="block text-sm font-semibold text-foreground mb-1.5">
                  اسم الحامل
                </label>
                <input
                  id="holderName"
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-semibold text-foreground mb-1.5">
                  رقم الحساب
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="مثال: ACC-001"
                  required
                  disabled={loading}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 text-right"
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label htmlFor="balance" className="block text-sm font-semibold text-foreground mb-1.5">
                  الرصيد الافتتاحي
                </label>
                <input
                  id="balance"
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
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
                <label htmlFor="currency" className="block text-sm font-semibold text-foreground mb-1.5">
                  العملة
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg px-4 py-3 text-sm font-medium bg-destructive/10 border border-destructive/30 text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-bold btn-gold"
              >
                {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 نظام تحويل الأموال · جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </main>
  );
}
