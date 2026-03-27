import type { ITransactionRepository } from '@features/transaction/services/ITransactionRepository';
import type { Duration } from '@core/types/Duration';
import type { TransactionType } from '@features/transaction/types/Transaction';
import { MathUtils } from '@core/utils/MathUtils';

export interface ReportEntry {
  currency: string;
  type: TransactionType;
  total: number;
  count: number;
}

export class GetReportByCurrencyUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(duration: Duration): Promise<ReportEntry[]> {
    const transactions = await this.repo.getByDuration(duration);
    const included = transactions.filter((t) => t.isIncluded);

    const grouped: Record<string, ReportEntry> = {};

    for (const tx of included) {
      const key = `${tx.currency}_${tx.type}`;
      if (!grouped[key]) {
        grouped[key] = { currency: tx.currency, type: tx.type, total: 0, count: 0 };
      }
      grouped[key].total = MathUtils.round(grouped[key].total + tx.amount, 2);
      grouped[key].count++;
    }

    return Object.values(grouped).sort((a, b) => {
      if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
      return a.type.localeCompare(b.type);
    });
  }
}
