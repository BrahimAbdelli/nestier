import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, Repository } from 'typeorm';
import { Logger } from '@shared/common/logger/logger.service';
import { BaseEntityMapperInterface } from '../../../../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { TypeOrmBaseRepository } from '../../../../base/infrastructure/adapters/repositories/orm-base.repository';
import { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/value-objects/product';
import { ProductEntity } from '../../entities/product.entity';

@Injectable()
export class TypeOrmProductRepository
  extends TypeOrmBaseRepository<ProductEntity, Product>
  implements ProductRepositoryInterface
{
  constructor(
    @InjectRepository(ProductEntity)
    repository: Repository<ProductEntity>,
    mapper: BaseEntityMapperInterface<ProductEntity, Product>,
    logger: Logger
  ) {
    super(repository, mapper, logger);
  }

  public async findExpensiveProducts(threshold: number): Promise<Product[]> {
    const productEntities: ProductEntity[] = await this.repository.find({
      where: {
        price: { $gt: threshold } as unknown as FindOperator<number>,
        isDeleted: false,
      },
    });
    return this.baseEntityMapper.persistencesToDomains(productEntities);
  }

  public async findProductsByName(name: string): Promise<Product[]> {
    const productEntities: ProductEntity[] = await this.repository.find({
      where: {
        name: { $regex: name, $options: 'i' } as unknown as FindOperator<string>,
        isDeleted: false,
      },
    });
    return this.baseEntityMapper.persistencesToDomains(productEntities);
  }
}
