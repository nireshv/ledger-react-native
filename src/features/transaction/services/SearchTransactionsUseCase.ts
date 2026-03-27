import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction } from '../types/Transaction';

export class SearchTransactionsUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(query: string): Promise<Transaction[]> {
    if (!query.trim()) return this.repo.getAll();
    return this.repo.search(query.trim());
  }
}
