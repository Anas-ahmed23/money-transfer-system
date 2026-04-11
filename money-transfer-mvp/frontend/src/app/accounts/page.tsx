import Link from 'next/link';
import { AccountsListSection } from '@/components/accounts/AccountsListSection';
import { Account } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
      take: 500,
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground mb-1">الحسابات</h2>
            <p className="text-muted-foreground text-sm">عرض جميع الحسابات ورصيدها الحالي</p>
          </div>
          <Link
            href="/accounts/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-gold"
          >
            + إنشاء حساب
          </Link>
        </div>
        <AccountsListSection accounts={accounts} />
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
