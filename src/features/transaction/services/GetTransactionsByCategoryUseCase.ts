import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction } from '../types/Transaction';
import type { Duration } from '@core/types/Duration';

export class GetTransactionsByCategoryUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(categoryId: string, duration?: Duration): Promise<Transaction[]> {
    if (duration) {
      return this.repo.getByCategoryAndDuration(categoryId, duration);
    }
    return this.repo.getByCategory(categoryId);
  }
}
