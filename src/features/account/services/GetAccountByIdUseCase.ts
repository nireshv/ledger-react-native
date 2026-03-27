import type { IAccountRepository } from './IAccountRepository';
import type { Account } from '../types/Account';

export class GetAccountByIdUseCase {
  constructor(private readonly repo: IAccountRepository) {}

  async invoke(id: string): Promise<Account | null> {
    return this.repo.getById(id);
  }
}
