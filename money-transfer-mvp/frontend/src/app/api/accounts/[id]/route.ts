import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const account = await prisma.account.findUnique({ where: { id } });

    if (!account) {
      return NextResponse.json(
        { success: false, error: { message: 'الحساب غير موجود' } },
        { status: 404 }
      );
    }

    const data = {
      id: account.id,
      accountNumber: account.accountNumber,
      holderName: account.holderName,
      balance: account.balance.toNumber(),
      currency: account.currency,
      createdAt: account.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, error: { message: 'فشل في جلب الحساب' } },
      { status: 500 }
    );
  }
}
