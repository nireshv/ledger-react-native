/**
 * TransactionEntity — raw SQLite row shape.
 * SQLite has no Date/Boolean types; we use ISO strings and 0|1 integers.
 */
export interface TransactionEntity {
  id: string;
  type: string;               // 'DEBIT' | 'CREDIT' | 'TRANSFER'
  amount: number;             // REAL
  currency: string;
  exchange_rate: number;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  note: string;
  date: string;               // ISO 8601
  is_included: number;        // 0 | 1
  created_at: string;
  updated_at: string;
}
