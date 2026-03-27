import type { Category, CategoryInput } from '../types/Category';

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  upsert(category: CategoryInput): Promise<void>;
  delete(id: string): Promise<void>;
}
