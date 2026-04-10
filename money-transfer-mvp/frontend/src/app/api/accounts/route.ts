import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
