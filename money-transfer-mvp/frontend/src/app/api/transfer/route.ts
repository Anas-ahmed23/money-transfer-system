import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const COMMISSION_RATE = 0.02;

const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'حساب المصدر مطلوب'),
  toAccountId: z.string().min(1, 'حساب الوجهة مطلوب'),
  amount: z
    .number({ invalid_type_error: 'المبلغ يجب أن يكون رقماً' })
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .max(10_000_000, 'المبلغ يتجاوز الحد المسموح به'),
  currency: z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED'], {
    errorMap: () => ({ message: 'العملة غير صالحة' }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTransferSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: { message } },
        { status: 422 }
      );
    }

    const { fromAccountId, toAccountId, amount, currency } = parsed.data;

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { success: false, error: { message: 'لا يمكن التحويل إلى نفس الحساب' } },
        { status: 400 }
      );
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: fromAccountId } }),
      prisma.account.findUnique({ where: { id: toAccountId } }),
    ]);

    if (!fromAccount) {
      return NextResponse.json(
        { success: false, error: { message: 'حساب المصدر غير موجود' } },
        { status: 404 }
      );
    }
    if (!toAccount) {
      return NextResponse.json(
        { success: false, error: { message: 'حساب الوجهة غير موجود' } },
        { status: 404 }
      );
    }

    const commission = parseFloat((amount * COMMISSION_RATE).toFixed(2));
    const totalAmount = parseFloat((amount + commission).toFixed(2));

    if (fromAccount.balance.toNumber() < totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `الرصيد غير كافٍ. الرصيد المتاح: ${fromAccount.balance.toNumber().toLocaleString('en-US')} ${fromAccount.currency}`,
          },
        },
        { status: 400 }
      );
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const newTransfer = await tx.transfer.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
          currency,
          commission,
          totalAmount,
          status: 'COMPLETED',
        },
        include: { fromAccount: true, toAccount: true },
      });

      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: totalAmount } },
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      return newTransfer;
    });

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

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في إنشاء التحويل' } },
      { status: 500 }
    );
  }
}
