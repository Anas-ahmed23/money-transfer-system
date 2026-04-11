import { TransferForm } from '@/components/transfer/TransferForm';
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

export default async function TransferPage() {
  const accounts = await getAccounts();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">تحويل الأموال</h2>
            <p className="text-muted-foreground">حوّل الأموال بين الحسابات بأمان وسرعة</p>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border bg-card">
              <p className="text-muted-foreground font-medium">
                تعذر تحميل الحسابات. يرجى المحاولة مرة أخرى لاحقاً.
              </p>
            </div>
          ) : (
            <TransferForm accounts={accounts} />
          )}
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
