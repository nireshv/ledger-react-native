import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction } from '../types/Transaction';

export class GetTransactionsUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(): Promise<Transaction[]> {
    return this.repo.getAll();
  }
}
