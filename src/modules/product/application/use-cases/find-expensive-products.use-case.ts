import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository, PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/value-objects/product';

@Injectable()
export class FindExpensiveProductsUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository) {}

  public execute(threshold: number = 1000): Promise<Product[]> {
    return this.productRepository.findExpensiveProducts(threshold);
  }
}
