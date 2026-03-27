import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { ColorUtils } from '@core/utils/ColorUtils';
import { createLogger } from '@core/utils/Logger';

const log = createLogger('LedgerDatabase');

const DB_NAME = 'ledger_database.db';
const SCHEMA_VERSION = 1;

const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS accounts (
    id                    TEXT PRIMARY KEY,
    name                  TEXT NOT NULL,
    currency              TEXT NOT NULL,
    balance               REAL NOT NULL DEFAULT 0,
    color_hex             TEXT NOT NULL,
    is_included_in_total  INTEGER NOT NULL DEFAULT 1,
    created_at            TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    color_hex   TEXT NOT NULL,
    icon_name   TEXT,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id            TEXT PRIMARY KEY,
    type          TEXT NOT NULL CHECK(type IN ('DEBIT','CREDIT','TRANSFER')),
    amount        REAL NOT NULL,
    currency      TEXT NOT NULL,
    exchange_rate REAL NOT NULL DEFAULT 1.0,
    account_id    TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    category_id   TEXT REFERENCES categories(id) ON DELETE SET NULL,
    note          TEXT NOT NULL DEFAULT '',
    date          TEXT NOT NULL,
    is_included   INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_account  ON transactions(account_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);
`;

/** Default categories seeded on first install */
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining',   colorHex: '#ef4444' },
  { name: 'Transport',       colorHex: '#f97316' },
  { name: 'Shopping',        colorHex: '#eab308' },
  { name: 'Entertainment',   colorHex: '#8b5cf6' },
  { name: 'Health',          colorHex: '#22c55e' },
  { name: 'Utilities',       colorHex: '#3b82f6' },
  { name: 'Housing',         colorHex: '#64748b' },
  { name: 'Salary',          colorHex: '#10b981' },
  { name: 'Freelance',       colorHex: '#0ea5e9' },
  { name: 'Investment',      colorHex: '#6366f1' },
  { name: 'Gifts',           colorHex: '#ec4899' },
  { name: 'Other',           colorHex: '#78716c' },
];

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable WAL mode for concurrent read performance (equivalent to Room's WAL mode)
  await db.execAsync('PRAGMA journal_mode = WAL;');
  // Enforce foreign key constraints (equivalent to Room's FK support)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const userVersion = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = userVersion?.user_version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    log.info('Running migrations from version', currentVersion, '→', SCHEMA_VERSION);

    await db.execAsync(CREATE_TABLES);
    await _seedDefaultData(db);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);

    log.info('Database initialized at version', SCHEMA_VERSION);
  } else {
    log.debug('Database already at version', currentVersion);
  }

  return db;
}

async function _seedDefaultData(db: SQLite.SQLiteDatabase): Promise<void> {
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories',
  );
  if ((count?.count ?? 0) > 0) return;

  const now = new Date().toISOString();
  for (const cat of DEFAULT_CATEGORIES) {
    const id = Crypto.randomUUID();
    await db.runAsync(
      'INSERT INTO categories (id, name, color_hex, icon_name, created_at) VALUES (?,?,?,?,?)',
      [id, cat.name, cat.colorHex, null, now],
    );
  }

  log.info('Seeded default categories');
}
