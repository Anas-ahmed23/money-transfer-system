import Link from 'next/link';
import { AccountSummaryCard } from '@/components/accounts/AccountSummaryCard';
import { AccountTransactionsTable } from '@/components/accounts/AccountTransactionsTable';
import { Account, AccountTransaction } from '@/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AccountStatementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  let account: Account | null = null;
  let transactions: AccountTransaction[] = [];

  try {
    const raw = await prisma.account.findUnique({ where: { id } });
    if (raw) {
      account = {
        id: raw.id,
        accountNumber: raw.accountNumber,
        holderName: raw.holderName,
        balance: raw.balance.toNumber(),
        currency: raw.currency as Account['currency'],
        createdAt: raw.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.error('DB ERROR (account):', err);
  }

  if (account) {
    try {
      const rawTransfers = await prisma.transfer.findMany({
        where: {
          OR: [{ fromAccountId: id }, { toAccountId: id }],
        },
        include: {
          fromAccount: {
            select: { id: true, accountNumber: true, holderName: true },
          },
          toAccount: {
            select: { id: true, accountNumber: true, holderName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      transactions = rawTransfers.map((t) => ({
        id: t.id,
        direction: (t.fromAccountId === id ? 'outgoing' : 'incoming') as
          | 'outgoing'
          | 'incoming',
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
        amount: t.amount.toNumber(),
        commission: t.commission.toNumber(),
        totalAmount: t.totalAmount.toNumber(),
        currency: t.currency as AccountTransaction['currency'],
        status: t.status as AccountTransaction['status'],
        createdAt: t.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('DB ERROR (transactions):', err);
    }
  }

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

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Back Link */}
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← الحسابات
        </Link>

        {!account ? (
          <div
            className="text-center py-16 rounded-xl border"
            style={{
              background: 'hsl(224 44% 9%)',
              borderColor: 'hsl(221 42% 17%)',
            }}
          >
            <p className="text-muted-foreground font-medium text-lg">
              الحساب غير موجود
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              لم يتم العثور على حساب بهذا المعرّف.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">
                كشف الحساب
              </h2>
              <p className="text-muted-foreground text-sm">
                سجل الحركات الكاملة للحساب
              </p>
            </div>

            <AccountSummaryCard account={account} />

            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                الحركات
              </h3>
              <AccountTransactionsTable transactions={transactions} />
            </div>
          </>
        )}
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
