import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
    });

    const data = accounts.map((account) => ({
      id: account.id,
      accountNumber: account.accountNumber,
      holderName: account.holderName,
      balance: account.balance.toNumber(),
      currency: account.currency,
      createdAt: account.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في جلب الحسابات' } },
      { status: 500 }
    );
  }
}

const createAccountSchema = z.object({
  holderName: z.string().min(1, 'اسم الحامل مطلوب'),
  accountNumber: z.string().min(1, 'رقم الحساب مطلوب'),
  balance: z
    .number({ invalid_type_error: 'الرصيد يجب أن يكون رقماً' })
    .min(0, 'الرصيد يجب أن يكون صفراً أو أكثر'),
  currency: z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED'], {
    errorMap: () => ({ message: 'العملة غير صالحة' }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: { message } },
        { status: 422 }
      );
    }

    const { holderName, accountNumber, balance, currency } = parsed.data;

    const existing = await prisma.account.findUnique({
      where: { accountNumber },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { message: 'رقم الحساب مستخدم بالفعل' } },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        holderName,
        accountNumber,
        balance,
        currency,
      },
    });

    const data = {
      id: account.id,
      accountNumber: account.accountNumber,
      holderName: account.holderName,
      balance: account.balance.toNumber(),
      currency: account.currency,
      createdAt: account.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { success: false, error: { message: 'رقم الحساب مستخدم بالفعل' } },
        { status: 400 }
      );
    }
    console.error('Error creating account:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في إنشاء الحساب' } },
      { status: 500 }
    );
  }
}
