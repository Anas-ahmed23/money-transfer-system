import { z } from 'zod';

const CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED'] as const;

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'حساب المصدر مطلوب'),
  toAccountId: z.string().min(1, 'حساب الوجهة مطلوب'),
  amount: z
    .number({ invalid_type_error: 'المبلغ يجب أن يكون رقماً' })
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .max(10_000_000, 'المبلغ يتجاوز الحد المسموح به'),
  currency: z.enum(CURRENCIES, {
    errorMap: () => ({ message: 'العملة غير صالحة' }),
  }),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
