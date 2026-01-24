import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository, PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/value-objects/product';

@Injectable()
export class FindProductsByNameUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository
  ) { }

  public execute(name: string): Promise<Product[]> {
    return this.productRepository.findProductsByName(name);
  }
}
