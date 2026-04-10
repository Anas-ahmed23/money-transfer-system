import Link from 'next/link';
import { AccountsTable } from '@/components/accounts/AccountsTable';
import { Account } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
    });
    return accounts.map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      holderName: a.holderName,
      balance: a.balance.toNumber(),
      currency: a.currency as Account['currency'],
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('DB ERROR:', err);
    return [];
  }
}

export default async function AccountsPage() {
  const accounts = await getAccounts();

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
          <div className="flex items-center gap-3">
            <Link
              href="/transfer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
              }}
            >
              إجراء تحويل
            </Link>
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
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-foreground mb-1">
            الحسابات
          </h2>
          <p className="text-muted-foreground text-sm">
            عرض جميع الحسابات ورصيدها الحالي
          </p>
        </div>
        <AccountsTable accounts={accounts} />
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
