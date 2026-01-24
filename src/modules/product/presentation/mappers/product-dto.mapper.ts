import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Attribute } from '@shared/common/search/domains/attribute';
import { Query } from '@shared/common/search/domains/query';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { BaseDtoMapperInterface } from '../../../base/presentation/dtos/base-dto-mapper.interface';
import { Product } from '../../domain/value-objects/product';
import { CreateProductDto, FindAndSearchProductResponseDto, ProductDto, UpdateProductDto } from '../dtos';
import { AttributeDto } from '@shared/common/search';

@Injectable()
export class ProductDtoMapper extends BaseDtoMapperInterface<Product, ProductDto, CreateProductDto, UpdateProductDto, FindAndSearchProductResponseDto> {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {
    super();
  }

  public domainToDto(source: Product): ProductDto {
    return this.classMapper.map(source, Product, ProductDto);
  }

  public dtoToDomain(source: FindAndSearchProductResponseDto): Product {
    return this.classMapper.map(source, FindAndSearchProductResponseDto, Product);
  }

  public domainsToFindAndSearchDtos(source: Product[]): FindAndSearchProductResponseDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Product, FindAndSearchProductResponseDto);
  }

  public domainsToDtos(source: Product[]): ProductDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Product, ProductDto);
  }

  public dtosToDomains(source: FindAndSearchProductResponseDto[]): Product[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, FindAndSearchProductResponseDto, Product);
  }

  public createDtoToDomain(source: CreateProductDto): Product {
    return this.classMapper.map(source, CreateProductDto, Product);
  }

  public updateDtoToDomain(source: UpdateProductDto): Product {
    return this.classMapper.map(source, UpdateProductDto, Product);
  }

  public queryDtoToDomain(source: QueryDto<ProductDto>): Query<Product> {
    const query: Query<Product> = new Query<Product>();
    query.take = source.take;
    query.skip = source.skip;
    query.type = source.type;
    query.orders = source.orders;
    query.isPaginable = source.isPaginable;
    query.attributes = source.attributes.map((attributeDto: AttributeDto) => {
      const attribute: Attribute = new Attribute();
      attribute.key = attributeDto.key;
      attribute.comparator = attributeDto.comparator;
      attribute.value = attributeDto.value;
      return attribute;
    });
    return query;
  }

  public domainToResponsePaginateDto(source: ResponsePaginate<Product>): ResponsePaginate<ProductDto> {
    return {
      data: this.domainsToDtos(source.data),
      count: source.count
    };
  }
}
