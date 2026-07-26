import { BaseRepository } from '../../../../modules/base/domain/repositories/base.repository';
import { Product } from '../value-objects/product';

export interface ProductRepositoryInterface extends BaseRepository<Product> {
  findExpensiveProducts(threshold: number): Promise<Product[]>;
  findProductsByName(name: string): Promise<Product[]>;
}
