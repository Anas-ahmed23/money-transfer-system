import { TransferSummary, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SummaryCardProps {
  summary: TransferSummary | null;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary || summary.amount <= 0) {
    return (
      <div
        className="rounded-xl border border-dashed flex items-center justify-center py-8"
        style={{ borderColor: 'hsl(221 42% 22%)', background: 'hsl(224 44% 8%)' }}
      >
        <p className="text-sm text-muted-foreground">أدخل مبلغ التحويل لعرض الملخص</p>
      </div>
    );
  }

  const { amount, commission, totalAmount, currency } = summary;

  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{
        background: 'hsl(223 40% 11%)',
        border: '1px solid rgba(201,168,76,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-5 w-5 rounded-full flex items-center justify-center text-xs"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}
        >
          ☰
        </div>
        <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>
          ملخص التحويل
        </span>
      </div>

      {/* Rows */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">المبلغ الأصلي</span>
        <span className="font-semibold text-sm text-foreground">
          {formatCurrency(amount, currency)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">العمولة (2٪)</span>
        <span className="font-semibold text-sm" style={{ color: '#d97706' }}>
          + {formatCurrency(commission, currency)}
        </span>
      </div>

      <Separator style={{ borderColor: 'hsl(221 42% 20%)' }} />

      <div className="flex items-center justify-between pt-1">
        <span className="font-bold text-foreground">إجمالي المبلغ المخصوم</span>
        <span className="font-bold text-lg" style={{ color: '#f0c040' }}>
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground text-center pt-1">
        العملة: {CURRENCY_LABELS[currency]}
      </p>
    </div>
  );
}
