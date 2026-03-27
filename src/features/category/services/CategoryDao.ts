import type { SQLiteDatabase } from 'expo-sqlite';
import type { CategoryEntity } from './CategoryEntity';

export class CategoryDao {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<CategoryEntity[]> {
    return this.db.getAllAsync<CategoryEntity>(
      'SELECT * FROM categories ORDER BY name ASC',
    );
  }

  async getById(id: string): Promise<CategoryEntity | null> {
    return this.db.getFirstAsync<CategoryEntity>(
      'SELECT * FROM categories WHERE id = ?',
      [id],
    );
  }

  async upsert(entity: CategoryEntity): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO categories (id, name, color_hex, icon_name, created_at)
       VALUES (?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         name      = excluded.name,
         color_hex = excluded.color_hex,
         icon_name = excluded.icon_name`,
      [entity.id, entity.name, entity.color_hex, entity.icon_name, entity.created_at],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  }
}
