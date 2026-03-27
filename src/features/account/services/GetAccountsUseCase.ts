import type { IAccountRepository } from './IAccountRepository';
import type { Account } from '../types/Account';

export class GetAccountsUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async invoke(): Promise<Account[]> {
    return this.repo.getAll();
  }
}
