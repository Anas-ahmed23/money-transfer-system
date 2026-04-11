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

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderName,
          accountNumber,
          balance: parseFloat(balance),
          currency,
        }),
      });

      const json = await res.json();

      if (!json.success) {
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

  const inputStyle: React.CSSProperties = {
    background: 'hsl(224 44% 9%)',
    border: '1px solid hsl(221 42% 17%)',
    color: 'white',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '0.375rem',
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                color: '#0a0f1e',
              }}
            >
              ت
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-none">
                نظام التحويلات
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Money Transfer System
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              border: '1px solid #c9a84c',
              color: '#c9a84c',
              background: 'rgba(201,168,76,0.08)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full inline-block animate-pulse"
              style={{ background: '#c9a84c' }}
            />
            متصل
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          → الحسابات
        </Link>

        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-foreground mb-1">
              إنشاء حساب جديد
            </h2>
            <p className="text-sm text-muted-foreground">
              أدخل بيانات الحساب لإضافته إلى النظام
            </p>
          </div>

          {/* Form Card */}
          <div
            className="rounded-xl border p-6 space-y-5"
            style={{
              background: 'hsl(224 44% 9%)',
              borderColor: 'hsl(221 42% 17%)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Holder Name */}
              <div>
                <label htmlFor="holderName" style={labelStyle}>
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
                  style={inputStyle}
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" style={labelStyle}>
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
                  style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label htmlFor="balance" style={labelStyle}>
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
                  style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" style={labelStyle}>
                  العملة
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
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
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #f0c040)',
                  color: '#0a0f1e',
                }}
              >
                {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
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
