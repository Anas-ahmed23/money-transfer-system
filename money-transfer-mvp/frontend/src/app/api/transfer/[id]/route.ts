import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { fromAccount: true, toAccount: true },
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: { message: 'التحويل غير موجود' } },
        { status: 404 }
      );
    }

    const data = {
      id: transfer.id,
      fromAccountId: transfer.fromAccountId,
      toAccountId: transfer.toAccountId,
      amount: transfer.amount.toNumber(),
      currency: transfer.currency,
      commission: transfer.commission.toNumber(),
      totalAmount: transfer.totalAmount.toNumber(),
      status: transfer.status,
      createdAt: transfer.createdAt.toISOString(),
      fromAccount: {
        id: transfer.fromAccount.id,
        accountNumber: transfer.fromAccount.accountNumber,
        holderName: transfer.fromAccount.holderName,
        balance: transfer.fromAccount.balance.toNumber(),
        currency: transfer.fromAccount.currency,
        createdAt: transfer.fromAccount.createdAt.toISOString(),
      },
      toAccount: {
        id: transfer.toAccount.id,
        accountNumber: transfer.toAccount.accountNumber,
        holderName: transfer.toAccount.holderName,
        balance: transfer.toAccount.balance.toNumber(),
        currency: transfer.toAccount.currency,
        createdAt: transfer.toAccount.createdAt.toISOString(),
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching transfer:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في جلب التحويل' } },
      { status: 500 }
    );
  }
}
