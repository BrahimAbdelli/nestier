import { Injectable } from '@nestjs/common';
import { Logger } from '@shared/common/logger/logger.service';
import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../infrastructure/entities/product.entity';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';
import { ProductTestInterface } from '../interfaces/product-test.interface';
import { mockProductArrayFactory, mockProductFactory } from '../mocks/product.mock';

@Injectable()
export class ProductTestService implements ProductTestInterface {
  private testProducts: ProductEntity[] = [];

  constructor(
    private readonly productRepository: Repository<ProductEntity>,
    private readonly logger: Logger
  ) {}

  async clearProducts(): Promise<void> {
    try {
      await this.productRepository.clear();
      this.logger.log('Products collection cleared successfully');
    } catch (error: any) {
      if ((error.name === 'MongoError' || error.name === 'MongoServerError') && error.code === 26) {
        this.logger.logQueryError('Collection does not exist. Unable to clear.', error.message);
        return;
      }
      this.logger.logQueryError('An error occurred:', error.toString());
    }
  }

  public async insertTestProducts(count: number): Promise<void> {
    const productDtos: CreateProductDto[] = mockProductArrayFactory(count);

    const products: ProductEntity[] = productDtos.map((dto: CreateProductDto): ProductEntity => {
      const entity: ProductEntity = new ProductEntity();
      entity.name = dto.name;
      entity.price = dto.price;
      entity.description = dto.description;
      entity.isDeleted = false;
      entity.userCreated = new ObjectId('65f9f7dec2cd92ee90d80fa4');
      entity.userUpdated = new ObjectId('65f9f7dec2cd92ee90d80fa4');
      return entity;
    });

    try {
      const savedProducts: ProductEntity[] = await this.productRepository.save(products);
      this.testProducts = savedProducts;
      this.logger.logQuery(`${savedProducts.length} test products inserted successfully`);
    } catch (error: unknown) {
      this.logger.logQueryError('Failed to insert test products:', (error as Error).message);
      throw error;
    }
  }

  public getTestProducts(): Promise<ProductEntity[]> {
    return this.productRepository.find();
  }

  public generateTestProduct(overrides?: Partial<CreateProductDto>): CreateProductDto {
    return mockProductFactory(overrides);
  }

  public generateTestProducts(count: number, overrides?: Partial<CreateProductDto>): CreateProductDto[] {
    return mockProductArrayFactory(count, overrides);
  }

  public async cleanupAfterTest(): Promise<void> {
    if (this.testProducts.length > 0) {
      try {
        await this.productRepository.remove(this.testProducts);
        this.logger.logQuery('Test products cleaned up successfully');
        this.testProducts = [];
      } catch (error: unknown) {
        this.logger.error('Failed to cleanup test products:', (error as Error).message);
      }
    }
  }
}
