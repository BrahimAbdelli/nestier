import { ProductRepositoryInterface } from './product.repository.interface';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
export type ProductRepository = ProductRepositoryInterface;
