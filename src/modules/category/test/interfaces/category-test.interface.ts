import { CategoryEntity } from '../../infrastructure/entities/category.entity';
import { CreateCategoryDto } from '../../presentation/dtos/create-category.dto';

export interface CategoryTestInterface {
  // Database operations
  clearCategories(): Promise<void>;
  insertTestCategories(count: number): Promise<void>;
  getTestCategories(): Promise<CategoryEntity[]>;

  // Test data generation
  generateTestCategory(overrides?: Partial<CreateCategoryDto>): CreateCategoryDto;
  generateTestCategories(count: number, overrides?: Partial<CreateCategoryDto>): CreateCategoryDto[];

  // Cleanup operations
  cleanupAfterTest(): Promise<void>;
}
