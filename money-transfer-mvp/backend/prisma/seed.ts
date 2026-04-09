import { PrismaClient, Currency } from '@prisma/client';

const prisma = new PrismaClient();

const accounts = [
  {
    accountNumber: 'SA01-1234-5678',
    holderName: 'أحمد محمد العمري',
    balance: 50000.00,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA02-2345-6789',
    holderName: 'فاطمة علي الزهراني',
    balance: 125000.50,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA03-3456-7890',
    holderName: 'خالد عبدالله القحطاني',
    balance: 8750.25,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA04-4567-8901',
    holderName: 'نورة سعد الدوسري',
    balance: 200000.00,
    currency: Currency.SAR,
  },
  {
    accountNumber: 'SA05-5678-9012',
    holderName: 'عمر يوسف الغامدي',
    balance: 35500.75,
    currency: Currency.SAR,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { accountNumber: account.accountNumber },
      update: {},
      create: account,
    });
  }

  console.log(`✅ Seeded ${accounts.length} accounts successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
