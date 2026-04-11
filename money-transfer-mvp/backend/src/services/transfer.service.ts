import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { CreateTransferInput } from '../validation/transfer.validation';
import { TransferDto } from '../types';

const COMMISSION_RATE = 0.02;

function toTransferDto(transfer: {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: { toNumber: () => number };
  currency: string;
  commission: { toNumber: () => number };
  totalAmount: { toNumber: () => number };
  status: string;
  createdAt: Date;
  fromAccount: {
    id: string;
    accountNumber: string;
    holderName: string;
    balance: { toNumber: () => number };
    currency: string;
    createdAt: Date;
  };
  toAccount: {
    id: string;
    accountNumber: string;
    holderName: string;
    balance: { toNumber: () => number };
    currency: string;
    createdAt: Date;
  };
}): TransferDto {
  return {
    id: transfer.id,
    fromAccountId: transfer.fromAccountId,
    toAccountId: transfer.toAccountId,
    amount: transfer.amount.toNumber(),
    currency: transfer.currency as TransferDto['currency'],
    commission: transfer.commission.toNumber(),
    totalAmount: transfer.totalAmount.toNumber(),
    status: transfer.status as TransferDto['status'],
    createdAt: transfer.createdAt.toISOString(),
    fromAccount: {
      id: transfer.fromAccount.id,
      accountNumber: transfer.fromAccount.accountNumber,
      holderName: transfer.fromAccount.holderName,
      balance: transfer.fromAccount.balance.toNumber(),
      currency: transfer.fromAccount.currency as TransferDto['currency'],
      createdAt: transfer.fromAccount.createdAt.toISOString(),
    },
    toAccount: {
      id: transfer.toAccount.id,
      accountNumber: transfer.toAccount.accountNumber,
      holderName: transfer.toAccount.holderName,
      balance: transfer.toAccount.balance.toNumber(),
      currency: transfer.toAccount.currency as TransferDto['currency'],
      createdAt: transfer.toAccount.createdAt.toISOString(),
    },
  };
}

export class TransferService {
  async createTransfer(input: CreateTransferInput): Promise<TransferDto> {
    const { fromAccountId, toAccountId, amount, currency } = input;

    if (fromAccountId === toAccountId) {
      throw new AppError('لا يمكن التحويل إلى نفس الحساب', 400, 'SAME_ACCOUNT');
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: fromAccountId } }),
      prisma.account.findUnique({ where: { id: toAccountId } }),
    ]);

    if (!fromAccount) {
      throw new AppError('حساب المصدر غير موجود', 404, 'ACCOUNT_NOT_FOUND');
    }
    if (!toAccount) {
      throw new AppError('حساب الوجهة غير موجود', 404, 'ACCOUNT_NOT_FOUND');
    }

    if (fromAccount.currency !== currency) {
      throw new AppError(
        `عملة حساب المصدر هي ${fromAccount.currency}. لا يمكن إجراء تحويل بعملة ${currency}.`,
        400,
        'CURRENCY_MISMATCH'
      );
    }

    if (toAccount.currency !== currency) {
      throw new AppError(
        `عملة حساب الوجهة هي ${toAccount.currency}. التحويل يجب أن يكون بنفس عملة الحسابين.`,
        400,
        'CURRENCY_MISMATCH'
      );
    }

    const commission = parseFloat((amount * COMMISSION_RATE).toFixed(2));
    const totalAmount = parseFloat((amount + commission).toFixed(2));

    if (fromAccount.balance.toNumber() < totalAmount) {
      throw new AppError(
        `الرصيد غير كافٍ. الرصيد المتاح: ${fromAccount.balance.toNumber().toLocaleString('en-US')} ${fromAccount.currency}`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    const transfer = await prisma.$transaction(async (tx) => {
      const newTransfer = await tx.transfer.create({
        data: {
          fromAccountId,
          toAccountId,
          amount: new Decimal(amount),
          currency,
          commission: new Decimal(commission),
          totalAmount: new Decimal(totalAmount),
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

    return toTransferDto(transfer);
  }

  async findById(id: string): Promise<TransferDto> {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { fromAccount: true, toAccount: true },
    });

    if (!transfer) {
      throw new AppError('التحويل غير موجود', 404, 'TRANSFER_NOT_FOUND');
    }

    return toTransferDto(transfer);
  }
}
