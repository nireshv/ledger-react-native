import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction } from '../types/Transaction';
import type { Duration } from '@core/types/Duration';

export class GetTransactionsByDurationUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(duration: Duration): Promise<Transaction[]> {
    return this.repo.getByDuration(duration);
  }
}
