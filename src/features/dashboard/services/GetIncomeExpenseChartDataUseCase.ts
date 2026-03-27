import type { ITransactionRepository } from '@features/transaction/services/ITransactionRepository';
import type { Duration } from '@core/types/Duration';
import { format } from 'date-fns';
import { MathUtils } from '@core/utils/MathUtils';

export interface ChartDataPoint {
  label: string;   // e.g. "Jan", "Feb" or day "1", "2" ...
  income: number;
  expense: number;
}

export class GetIncomeExpenseChartDataUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  async invoke(duration: Duration, currency: string): Promise<ChartDataPoint[]> {
    const transactions = await this.transactionRepo.getByDuration(duration);
    const relevant = transactions.filter(
      (t) => t.currency === currency && t.isIncluded && t.type !== 'TRANSFER',
    );

    // Group by period label
    const isYearly = duration.type === 'YEAR';
    const grouped: Record<string, { income: number; expense: number }> = {};

    for (const tx of relevant) {
      const label = isYearly
        ? format(tx.date, 'MMM')
        : format(tx.date, 'd');

      if (!grouped[label]) grouped[label] = { income: 0, expense: 0 };

      if (tx.type === 'CREDIT') {
        grouped[label].income = MathUtils.round(grouped[label].income + tx.amount, 2);
      } else {
        grouped[label].expense = MathUtils.round(grouped[label].expense + tx.amount, 2);
      }
    }

    return Object.entries(grouped).map(([label, { income, expense }]) => ({
      label,
      income,
      expense,
    }));
  }
}
