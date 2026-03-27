import type { ICategoryRepository } from './ICategoryRepository';
import type { Category } from '../types/Category';

export class GetCategoryByIdUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async invoke(id: string): Promise<Category | null> {
    return this.repo.getById(id);
  }
}
