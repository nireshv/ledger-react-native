import type { Transaction, TransactionInput, TransactionType } from '../types/Transaction';
import type { Duration } from '@core/types/Duration';

/**
 * ITransactionRepository — domain interface for transaction persistence.
 * Implementations live in the data layer. Equivalent to Android's repository interface pattern.
 */
export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  getByAccount(accountId: string): Promise<Transaction[]>;
  getByCategory(categoryId: string): Promise<Transaction[]>;
  getByDuration(duration: Duration): Promise<Transaction[]>;
  getByAccountAndDuration(accountId: string, duration: Duration): Promise<Transaction[]>;
  getByCategoryAndDuration(categoryId: string, duration: Duration): Promise<Transaction[]>;
  getByTypeAndDuration(type: TransactionType, duration: Duration): Promise<Transaction[]>;
  search(query: string): Promise<Transaction[]>;
  upsert(transaction: TransactionInput): Promise<void>;
  delete(id: string): Promise<void>;
  toggleInclusion(id: string, isIncluded: boolean): Promise<void>;
}
