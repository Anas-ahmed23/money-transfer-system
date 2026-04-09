import { prisma } from '../config/database';
import { AccountDto } from '../types';

function toAccountDto(account: {
  id: string;
  accountNumber: string;
  holderName: string;
  balance: { toNumber: () => number };
  currency: string;
  createdAt: Date;
}): AccountDto {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    holderName: account.holderName,
    balance: account.balance.toNumber(),
    currency: account.currency as AccountDto['currency'],
    createdAt: account.createdAt.toISOString(),
  };
}

export class AccountService {
  async findAll(): Promise<AccountDto[]> {
    const accounts = await prisma.account.findMany({
      orderBy: { holderName: 'asc' },
    });
    return accounts.map(toAccountDto);
  }

  async findById(id: string): Promise<AccountDto | null> {
    const account = await prisma.account.findUnique({ where: { id } });
    return account ? toAccountDto(account) : null;
  }
}
