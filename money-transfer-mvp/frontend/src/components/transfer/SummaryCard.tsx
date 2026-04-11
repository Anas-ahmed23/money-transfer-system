import { TransferSummary, CURRENCY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SummaryCardProps {
  summary: TransferSummary | null;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary || summary.amount <= 0) {
    return (
      <div className="rounded-xl border border-dashed border-border flex items-center justify-center py-8 bg-secondary/30">
        <p className="text-sm text-muted-foreground">أدخل مبلغ التحويل لعرض الملخص</p>
      </div>
    );
  }

  const { amount, commission, totalAmount, currency } = summary;

  return (
    <div className="rounded-xl p-5 space-y-3 bg-secondary border border-primary/15">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-5 w-5 rounded-full flex items-center justify-center text-xs bg-primary/15 text-primary">
          ☰
        </div>
        <span className="text-sm font-bold text-primary">ملخص التحويل</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">المبلغ الأصلي</span>
        <span className="font-semibold text-sm text-foreground">
          {formatCurrency(amount, currency)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">العمولة (2٪)</span>
        <span className="font-semibold text-sm text-amber-600">
          + {formatCurrency(commission, currency)}
        </span>
      </div>

      <Separator className="bg-border" />

      <div className="flex items-center justify-between pt-1">
        <span className="font-bold text-foreground">إجمالي المبلغ المخصوم</span>
        <span className="font-bold text-lg text-primary">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground text-center pt-1">
        العملة: {CURRENCY_LABELS[currency]}
      </p>
    </div>
  );
}
