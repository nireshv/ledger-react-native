import type { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import type { IBackupRepository } from './IBackupRepository';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('BackupRepositoryImpl');

interface BackupData {
  version: number;
  exportedAt: string;
  accounts: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
}

export class BackupRepositoryImpl implements IBackupRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async exportToFile(): Promise<string> {
    const [accounts, categories, transactions] = await Promise.all([
      this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM accounts'),
      this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM categories'),
      this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM transactions'),
    ]);

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
      categories,
      transactions,
    };

    const fileName = `ledger_backup_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    log.info('Backup exported', fileUri);
    return fileUri;
  }

  async importFromFile(fileUri: string): Promise<void> {
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const backup: BackupData = JSON.parse(content);

    if (!backup.version || !backup.accounts) {
      throw new Error('Invalid backup file format');
    }

    // Restore inside a transaction for atomicity
    await this.db.withTransactionAsync(async () => {
      await this.db.execAsync('DELETE FROM transactions');
      await this.db.execAsync('DELETE FROM accounts');
      await this.db.execAsync('DELETE FROM categories');

      for (const account of backup.accounts) {
        await this.db.runAsync(
          `INSERT INTO accounts (id, name, currency, balance, color_hex, is_included_in_total, created_at)
           VALUES (?,?,?,?,?,?,?)`,
          [
            account['id'] as string,
            account['name'] as string,
            account['currency'] as string,
            account['balance'] as number,
            account['color_hex'] as string,
            account['is_included_in_total'] as number,
            account['created_at'] as string,
          ],
        );
      }

      for (const category of backup.categories) {
        await this.db.runAsync(
          `INSERT INTO categories (id, name, color_hex, icon_name, created_at)
           VALUES (?,?,?,?,?)`,
          [
            category['id'] as string,
            category['name'] as string,
            category['color_hex'] as string,
            (category['icon_name'] as string | null) ?? null,
            category['created_at'] as string,
          ],
        );
      }

      for (const tx of backup.transactions) {
        await this.db.runAsync(
          `INSERT INTO transactions (id, type, amount, currency, exchange_rate,
            account_id, to_account_id, category_id, note, date, is_included, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            tx['id'] as string,
            tx['type'] as string,
            tx['amount'] as number,
            tx['currency'] as string,
            tx['exchange_rate'] as number,
            tx['account_id'] as string,
            (tx['to_account_id'] as string | null) ?? null,
            (tx['category_id'] as string | null) ?? null,
            tx['note'] as string,
            tx['date'] as string,
            tx['is_included'] as number,
            tx['created_at'] as string,
            tx['updated_at'] as string,
          ],
        );
      }
    });

    log.info('Backup restored from', fileUri);
  }
}
