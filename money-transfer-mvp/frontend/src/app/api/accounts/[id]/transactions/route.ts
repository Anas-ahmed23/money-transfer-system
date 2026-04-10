import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const account = await prisma.account.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: { message: 'الحساب غير موجود' } },
        { status: 404 }
      );
    }

    const transfers = await prisma.transfer.findMany({
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

    const data = transfers.map((t) => ({
      id: t.id,
      direction: t.fromAccountId === id ? 'outgoing' : 'incoming',
      fromAccount: t.fromAccount,
      toAccount: t.toAccount,
      amount: t.amount.toNumber(),
      commission: t.commission.toNumber(),
      totalAmount: t.totalAmount.toNumber(),
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في جلب حركات الحساب' } },
      { status: 500 }
    );
  }
}
