import type { Transaction, TransactionInput } from '../types/Transaction';
import type { TransactionEntity } from './TransactionEntity';

/**
 * TransactionMapper — explicit Entity ↔ Domain conversion.
 * Equivalent to Android's mapper pattern (no ORM magic).
 */
export class TransactionMapper {
  static toDomain(entity: TransactionEntity): Transaction {
    return {
      id: entity.id,
      type: entity.type as Transaction['type'],
      amount: entity.amount,
      currency: entity.currency,
      exchangeRate: entity.exchange_rate,
      accountId: entity.account_id,
      toAccountId: entity.to_account_id,
      categoryId: entity.category_id,
      note: entity.note,
      date: new Date(entity.date),
      isIncluded: entity.is_included === 1,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at),
    };
  }

  static toEntity(domain: TransactionInput): TransactionEntity {
    const now = new Date().toISOString();
    return {
      id: domain.id,
      type: domain.type,
      amount: domain.amount,
      currency: domain.currency,
      exchange_rate: domain.exchangeRate,
      account_id: domain.accountId,
      to_account_id: domain.toAccountId ?? null,
      category_id: domain.categoryId ?? null,
      note: domain.note,
      date: domain.date.toISOString(),
      is_included: domain.isIncluded ? 1 : 0,
      created_at: now,
      updated_at: now,
    };
  }
}
