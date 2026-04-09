import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateCommission(amount: number, rate = 0.02): number {
  return parseFloat((amount * rate).toFixed(2));
}

export function calculateTotal(amount: number, commission: number): number {
  return parseFloat((amount + commission).toFixed(2));
}
