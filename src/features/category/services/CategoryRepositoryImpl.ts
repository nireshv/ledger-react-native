import type { ICategoryRepository } from './ICategoryRepository';
import type { Category, CategoryInput } from '../types/Category';
import type { CategoryDao } from './CategoryDao';
import { CategoryMapper } from './CategoryMapper';

export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private readonly dao: CategoryDao) {}

  async getAll(): Promise<Category[]> {
    const entities = await this.dao.getAll();
    return entities.map(CategoryMapper.toDomain);
  }

  async getById(id: string): Promise<Category | null> {
    const entity = await this.dao.getById(id);
    return entity ? CategoryMapper.toDomain(entity) : null;
  }

  async upsert(category: CategoryInput): Promise<void> {
    const entity = CategoryMapper.toEntity(category);
    await this.dao.upsert(entity);
  }

  async delete(id: string): Promise<void> {
    await this.dao.delete(id);
  }
}
