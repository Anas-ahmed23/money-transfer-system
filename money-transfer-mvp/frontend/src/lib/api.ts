import { Account, AccountTransaction, ApiResponse, CreateTransferPayload, Transfer } from '@/types';

const BASE_URL = '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const json = await response.json();

  if (!response.ok) {
    const errorBody = json as { error?: { message?: string } };
    throw new Error(errorBody.error?.message ?? 'حدث خطأ غير متوقع');
  }

  return json as ApiResponse<T>;
}

export const api = {
  accounts: {
    list(): Promise<ApiResponse<Account[]>> {
      return request<Account[]>('/accounts');
    },
    getById(id: string): Promise<ApiResponse<Account>> {
      return request<Account>(`/accounts/${id}`);
    },
    getTransactions(id: string): Promise<ApiResponse<AccountTransaction[]>> {
      return request<AccountTransaction[]>(`/accounts/${id}/transactions`);
    },
  },
  transfers: {
    create(payload: CreateTransferPayload): Promise<ApiResponse<Transfer>> {
      return request<Transfer>('/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getById(id: string): Promise<ApiResponse<Transfer>> {
      return request<Transfer>(`/transfer/${id}`);
    },
  },
};
