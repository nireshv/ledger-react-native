import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction } from '../types/Transaction';

export class GetTransactionByIdUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async invoke(id: string): Promise<Transaction | null> {
    return this.repo.getById(id);
  }
}
