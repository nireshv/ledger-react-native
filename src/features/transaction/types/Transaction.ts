import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['DEBIT', 'CREDIT', 'TRANSFER']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/**
 * Transaction domain model — equivalent to Android's Transact domain model.
 * Plain TypeScript data class with no Android/Expo dependencies.
 */
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  type: TransactionTypeSchema,
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3, 'Currency must be ISO 4217 (3 chars)'),
  /** Exchange rate for cross-currency transfers; 1.0 for same-currency */
  exchangeRate: z.number().positive().default(1.0),
  accountId: z.string().uuid(),
  /** Destination account — only present for TRANSFER type */
  toAccountId: z.string().uuid().nullable().default(null),
  /** null allowed for TRANSFER transactions */
  categoryId: z.string().uuid().nullable().default(null),
  note: z.string().max(500).default(''),
  date: z.date(),
  /** When false, transaction is excluded from reports and balance calculations */
  isIncluded: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

/** Zod schema for creating/editing — id, createdAt, updatedAt are omitted */
export const TransactionInputSchema = TransactionSchema.omit({
  createdAt: true,
  updatedAt: true,
});
export type TransactionInput = z.infer<typeof TransactionInputSchema>;
