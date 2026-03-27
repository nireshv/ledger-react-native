import type { ITransactionRepository } from './ITransactionRepository';
import type { Transaction, TransactionInput, TransactionType } from '../types/Transaction';
import type { Duration } from '@core/types/Duration';
import type { TransactionDao } from './TransactionDao';
import { TransactionMapper } from './TransactionMapper';

export class TransactionRepositoryImpl implements ITransactionRepository {
  constructor(private readonly dao: TransactionDao) {}

  async getAll(): Promise<Transaction[]> {
    const entities = await this.dao.getAll();
    return entities.map(TransactionMapper.toDomain);
  }

  async getById(id: string): Promise<Transaction | null> {
    const entity = await this.dao.getById(id);
    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async getByAccount(accountId: string): Promise<Transaction[]> {
    const entities = await this.dao.getByAccount(accountId);
    return entities.map(TransactionMapper.toDomain);
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    const entities = await this.dao.getByCategory(categoryId);
    return entities.map(TransactionMapper.toDomain);
  }

  async getByDuration(duration: Duration): Promise<Transaction[]> {
    const entities = await this.dao.getByDuration(
      duration.startDate.toISOString(),
      duration.endDate.toISOString(),
    );
    return entities.map(TransactionMapper.toDomain);
  }

  async getByAccountAndDuration(accountId: string, duration: Duration): Promise<Transaction[]> {
    const entities = await this.dao.getByAccountAndDuration(
      accountId,
      duration.startDate.toISOString(),
      duration.endDate.toISOString(),
    );
    return entities.map(TransactionMapper.toDomain);
  }

  async getByCategoryAndDuration(categoryId: string, duration: Duration): Promise<Transaction[]> {
    const entities = await this.dao.getByCategoryAndDuration(
      categoryId,
      duration.startDate.toISOString(),
      duration.endDate.toISOString(),
    );
    return entities.map(TransactionMapper.toDomain);
  }

  async getByTypeAndDuration(type: TransactionType, duration: Duration): Promise<Transaction[]> {
    const entities = await this.dao.getByTypeAndDuration(
      type,
      duration.startDate.toISOString(),
      duration.endDate.toISOString(),
    );
    return entities.map(TransactionMapper.toDomain);
  }

  async search(query: string): Promise<Transaction[]> {
    const entities = await this.dao.search(query);
    return entities.map(TransactionMapper.toDomain);
  }

  async upsert(transaction: TransactionInput): Promise<void> {
    const entity = TransactionMapper.toEntity(transaction);
    await this.dao.upsert(entity);
  }

  async delete(id: string): Promise<void> {
    await this.dao.delete(id);
  }

  async toggleInclusion(id: string, isIncluded: boolean): Promise<void> {
    await this.dao.toggleInclusion(id, isIncluded ? 1 : 0);
  }
}
