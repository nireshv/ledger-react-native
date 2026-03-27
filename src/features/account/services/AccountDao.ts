import type { SQLiteDatabase } from 'expo-sqlite';
import type { AccountEntity } from './AccountEntity';

export class AccountDao {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<AccountEntity[]> {
    return this.db.getAllAsync<AccountEntity>(
      'SELECT * FROM accounts ORDER BY created_at ASC',
    );
  }

  async getById(id: string): Promise<AccountEntity | null> {
    return this.db.getFirstAsync<AccountEntity>(
      'SELECT * FROM accounts WHERE id = ?',
      [id],
    );
  }

  async upsert(entity: AccountEntity): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO accounts (id, name, currency, balance, color_hex, is_included_in_total, created_at)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         name                 = excluded.name,
         currency             = excluded.currency,
         balance              = excluded.balance,
         color_hex            = excluded.color_hex,
         is_included_in_total = excluded.is_included_in_total`,
      [
        entity.id,
        entity.name,
        entity.currency,
        entity.balance,
        entity.color_hex,
        entity.is_included_in_total,
        entity.created_at,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [newBalance, id],
    );
  }

  async toggleIncludedInTotal(id: string, included: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE accounts SET is_included_in_total = ? WHERE id = ?',
      [included, id],
    );
  }
}
