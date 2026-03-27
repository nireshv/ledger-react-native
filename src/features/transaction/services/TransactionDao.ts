import type { SQLiteDatabase } from 'expo-sqlite';
import type { TransactionEntity } from './TransactionEntity';
import type { TransactionType } from '../types/Transaction';

/**
 * TransactionDao — equivalent to a Room @Dao interface.
 * All queries use parameterized statements to prevent SQL injection.
 */
export class TransactionDao {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions ORDER BY date DESC',
    );
  }

  async getById(id: string): Promise<TransactionEntity | null> {
    return this.db.getFirstAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE id = ?',
      [id],
    );
  }

  async getByAccount(accountId: string): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE account_id = ? OR to_account_id = ? ORDER BY date DESC',
      [accountId, accountId],
    );
  }

  async getByCategory(categoryId: string): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC',
      [categoryId],
    );
  }

  async getByDuration(startDate: string, endDate: string): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startDate, endDate],
    );
  }

  async getByAccountAndDuration(
    accountId: string,
    startDate: string,
    endDate: string,
  ): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      `SELECT * FROM transactions
       WHERE (account_id = ? OR to_account_id = ?)
         AND date >= ? AND date <= ?
       ORDER BY date DESC`,
      [accountId, accountId, startDate, endDate],
    );
  }

  async getByCategoryAndDuration(
    categoryId: string,
    startDate: string,
    endDate: string,
  ): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE category_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      [categoryId, startDate, endDate],
    );
  }

  async getByTypeAndDuration(
    type: TransactionType,
    startDate: string,
    endDate: string,
  ): Promise<TransactionEntity[]> {
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE type = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      [type, startDate, endDate],
    );
  }

  async search(query: string): Promise<TransactionEntity[]> {
    const like = `%${query}%`;
    return this.db.getAllAsync<TransactionEntity>(
      'SELECT * FROM transactions WHERE note LIKE ? ORDER BY date DESC',
      [like],
    );
  }

  async upsert(entity: TransactionEntity): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO transactions (
        id, type, amount, currency, exchange_rate,
        account_id, to_account_id, category_id,
        note, date, is_included, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET
        type        = excluded.type,
        amount      = excluded.amount,
        currency    = excluded.currency,
        exchange_rate = excluded.exchange_rate,
        account_id  = excluded.account_id,
        to_account_id = excluded.to_account_id,
        category_id = excluded.category_id,
        note        = excluded.note,
        date        = excluded.date,
        is_included = excluded.is_included,
        updated_at  = excluded.updated_at`,
      [
        entity.id,
        entity.type,
        entity.amount,
        entity.currency,
        entity.exchange_rate,
        entity.account_id,
        entity.to_account_id,
        entity.category_id,
        entity.note,
        entity.date,
        entity.is_included,
        entity.created_at,
        entity.updated_at,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  }

  async toggleInclusion(id: string, isIncluded: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE transactions SET is_included = ?, updated_at = ? WHERE id = ?',
      [isIncluded, new Date().toISOString(), id],
    );
  }
}
