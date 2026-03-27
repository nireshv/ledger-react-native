import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  iconName: z.string().nullable().default(null),
  createdAt: z.date(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryInputSchema = CategorySchema.omit({ createdAt: true });
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
