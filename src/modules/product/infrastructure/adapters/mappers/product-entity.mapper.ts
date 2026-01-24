import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseEntityMapperInterface } from '../../../../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { Product } from '../../../domain/value-objects/product';
import { ProductEntity } from '../../entities/product.entity';

@Injectable()
export class ProductEntityMapper implements BaseEntityMapperInterface<ProductEntity, Product> {
  constructor(@InjectMapper() private readonly classMapper: Mapper) { }

  public domainToPersistence(source: Product): ProductEntity {
    return this.classMapper.map(source, Product, ProductEntity);
  }

  public persistenceToDomain(source: ProductEntity): Product {
    return this.classMapper.map(source, ProductEntity, Product);
  }

  public domainsToPersistences(source: Product[]): ProductEntity[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Product, ProductEntity);
  }

  public persistencesToDomains(source: ProductEntity[]): Product[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, ProductEntity, Product);
  }
}
