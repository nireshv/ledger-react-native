import type { IAccountRepository } from './IAccountRepository';
import { AccountInputSchema, type AccountInput } from '../types/Account';

export class UpsertAccountUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async invoke(input: AccountInput): Promise<void> {
    const validated = AccountInputSchema.parse(input);
    await this.repo.upsert(validated);
  }
}
