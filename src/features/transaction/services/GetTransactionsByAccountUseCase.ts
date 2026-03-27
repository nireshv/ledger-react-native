import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction } from '../types/Transaction';
import type { Duration } from '@core/types/Duration';

export class GetTransactionsByAccountUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(accountId: string, duration?: Duration): Promise<Transaction[]> {
    if (duration) {
      return this.repo.getByAccountAndDuration(accountId, duration);
    }
    return this.repo.getByAccount(accountId);
  }
}
