import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Attribute } from '@shared/common/search/domains/attribute';
import { Query } from '@shared/common/search/domains/query';
import { AttributeDto } from '@shared/common/search/dtos/attribute.dto';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { Product } from '../../domain/value-objects/product';
import { CreateProductDto, FindAndSearchProductResponseDto, ProductDto, UpdateProductDto } from '../dtos';

@Injectable()
export class ProductDtoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper): void => {
      createMap(mapper, Product, FindAndSearchProductResponseDto);
      createMap(mapper, FindAndSearchProductResponseDto, Product);
      createMap(mapper, Product, ProductDto);
      createMap(mapper, ProductDto, Product);
      createMap(mapper, Product, CreateProductDto);
      createMap(mapper, CreateProductDto, Product);
      createMap(mapper, Product, UpdateProductDto);
      createMap(mapper, UpdateProductDto, Product);
      createMap(mapper, AttributeDto, Attribute);
      createMap(mapper, QueryDto<ProductDto>, Query<Product>);
    };
  }
}
