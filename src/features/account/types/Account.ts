import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  currency: z.string().min(3).max(3),
  /** Computed from transactions — stored for fast reads */
  balance: z.number().default(0),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  /** When false, account balance is excluded from the total balance summary */
  isIncludedInTotal: z.boolean().default(true),
  createdAt: z.date(),
});

export type Account = z.infer<typeof AccountSchema>;

export const AccountInputSchema = AccountSchema.omit({ createdAt: true });
export type AccountInput = z.infer<typeof AccountInputSchema>;
