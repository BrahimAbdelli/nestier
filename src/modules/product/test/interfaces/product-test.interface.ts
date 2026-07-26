import { ProductEntity } from '../../infrastructure/entities/product.entity';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';

export interface ProductTestInterface {
  // Database operations
  clearProducts(): Promise<void>;
  insertTestProducts(count: number): Promise<void>;
  getTestProducts(): Promise<ProductEntity[]>;

  // Test data generation
  generateTestProduct(overrides?: Partial<CreateProductDto>): CreateProductDto;
  generateTestProducts(count: number, overrides?: Partial<CreateProductDto>): CreateProductDto[];

  // Cleanup operations
  cleanupAfterTest(): Promise<void>;
}
