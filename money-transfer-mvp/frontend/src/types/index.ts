export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Account {
  id: string;
  accountNumber: string;
  holderName: string;
  balance: number;
  currency: Currency;
  createdAt: string;
}

export interface CreateTransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
  commission: number;
  totalAmount: number;
  status: TransferStatus;
  createdAt: string;
  fromAccount: Account;
  toAccount: Account;
}

export interface TransferFormValues {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  currency: Currency;
}

export interface TransferSummary {
  amount: number;
  commission: number;
  totalAmount: number;
  currency: Currency;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  SAR: 'ريال سعودي',
  USD: 'دولار أمريكي',
  EUR: 'يورو',
  GBP: 'جنيه إسترليني',
  AED: 'درهم إماراتي',
};

export const COMMISSION_RATE = 0.02;

export interface AccountTransaction {
  id: string;
  direction: 'outgoing' | 'incoming';
  fromAccount: { id: string; accountNumber: string; holderName: string };
  toAccount:   { id: string; accountNumber: string; holderName: string };
  amount: number;
  commission: number;
  totalAmount: number;
  currency: Currency;
  status: TransferStatus;
  createdAt: string;
}
