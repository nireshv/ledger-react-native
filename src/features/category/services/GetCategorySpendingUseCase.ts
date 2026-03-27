import type { ITransactionRepository } from '@features/transaction/services/ITransactionRepository';
import type { ICategoryRepository } from './ICategoryRepository';
import type { Duration } from '@core/types/Duration';
import type { Category } from '../types/Category';
import { MathUtils } from '@core/utils/MathUtils';

export interface CategorySpending {
  category: Category;
  total: number;
  percentage: number;
  currency: string;
}

export class GetCategorySpendingUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly categoryRepo: ICategoryRepository,
  ) {}

  async invoke(duration: Duration, currency: string): Promise<CategorySpending[]> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepo.getByTypeAndDuration('DEBIT', duration),
      this.categoryRepo.getAll(),
    ]);

    const filtered = transactions.filter(
      (t) => t.currency === currency && t.isIncluded && t.categoryId,
    );

    const totalSpend = MathUtils.sum(filtered.map((t) => t.amount));

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const spendByCategory: Record<string, number> = {};

    for (const tx of filtered) {
      if (!tx.categoryId) continue;
      spendByCategory[tx.categoryId] =
        MathUtils.round((spendByCategory[tx.categoryId] ?? 0) + tx.amount, 2);
    }

    return Object.entries(spendByCategory)
      .map(([categoryId, total]) => ({
        category: categoryMap.get(categoryId)!,
        total,
        percentage: MathUtils.percentage(total, totalSpend),
        currency,
      }))
      .filter((s) => s.category)
      .sort((a, b) => b.total - a.total);
  }
}
