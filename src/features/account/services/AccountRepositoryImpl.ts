import type { IAccountRepository } from './IAccountRepository';
import type { Account, AccountInput } from '../types/Account';
import type { AccountDao } from './AccountDao';
import { AccountMapper } from './AccountMapper';

export class AccountRepositoryImpl implements IAccountRepository {
  constructor(private readonly dao: AccountDao) {}

  async getAll(): Promise<Account[]> {
    const entities = await this.dao.getAll();
    return entities.map(AccountMapper.toDomain);
  }

  async getById(id: string): Promise<Account | null> {
    const entity = await this.dao.getById(id);
    return entity ? AccountMapper.toDomain(entity) : null;
  }

  async upsert(account: AccountInput): Promise<void> {
    const entity = AccountMapper.toEntity(account);
    await this.dao.upsert(entity);
  }

  async delete(id: string): Promise<void> {
    await this.dao.delete(id);
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await this.dao.updateBalance(id, newBalance);
  }

  async toggleIncludedInTotal(id: string, included: boolean): Promise<void> {
    await this.dao.toggleIncludedInTotal(id, included ? 1 : 0);
  }
}
