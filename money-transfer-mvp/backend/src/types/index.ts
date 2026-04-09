export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface AccountDto {
  id: string;
  accountNumber: string;
  holderName: string;
  balance: number;
  currency: Currency;
  createdAt: string;
}

export interface CreateTransferDto {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
}

export interface TransferDto {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
  commission: number;
  totalAmount: number;
  status: TransferStatus;
  createdAt: string;
  fromAccount: AccountDto;
  toAccount: AccountDto;
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
