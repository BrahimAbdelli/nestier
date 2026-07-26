import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Product } from '../../../domain/value-objects/product';
import { ProductEntity } from '../../entities/product.entity';

@Injectable()
export class ProductEntityMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper): void => {
      createMap(mapper, Product, ProductEntity);
      createMap(mapper, ProductEntity, Product);
    };
  }
}
