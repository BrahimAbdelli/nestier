import { BaseRepository } from '../../../../modules/base/domain/repositories/base.repository';
import { ProductEntity } from '../../infrastructure/entities/product.entity';
import { Product } from '../value-objects/product';

export interface ProductRepositoryInterface extends BaseRepository<ProductEntity, Product> {
  findExpensiveProducts(threshold: number): Promise<Product[]>;
  findProductsByName(name: string): Promise<Product[]>;
}
