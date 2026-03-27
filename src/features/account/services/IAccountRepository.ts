import type { Account, AccountInput } from '../types/Account';

export interface IAccountRepository {
  getAll(): Promise<Account[]>;
  getById(id: string): Promise<Account | null>;
  upsert(account: AccountInput): Promise<void>;
  delete(id: string): Promise<void>;
  updateBalance(id: string, newBalance: number): Promise<void>;
  toggleIncludedInTotal(id: string, included: boolean): Promise<void>;
}
