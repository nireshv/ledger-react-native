import type { ICategoryRepository } from './ICategoryRepository';
import { CategoryInputSchema, type CategoryInput } from '../types/Category';

export class UpsertCategoryUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async invoke(input: CategoryInput): Promise<void> {
    const validated = CategoryInputSchema.parse(input);
    await this.repo.upsert(validated);
  }
}
