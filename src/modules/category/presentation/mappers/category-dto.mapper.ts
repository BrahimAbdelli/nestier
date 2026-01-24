import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Attribute } from '@shared/common/search/domains/attribute';
import { Query } from '@shared/common/search/domains/query';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { BaseDtoMapperInterface } from '../../../base/presentation/dtos/base-dto-mapper.interface';
import { Category } from '../../domain/value-objects/category';
import { CategoryDto, CreateCategoryDto, FindAndSearchCategoryResponseDto, UpdateCategoryDto } from '../dtos';
import { AttributeDto } from '@shared/common/search';

@Injectable()
export class CategoryDtoMapper implements BaseDtoMapperInterface<Category, CategoryDto, CreateCategoryDto, UpdateCategoryDto, FindAndSearchCategoryResponseDto> {
  constructor(@InjectMapper() private readonly classMapper: Mapper) { }

  public domainsToFindAndSearchDtos(source: Category[]): FindAndSearchCategoryResponseDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Category, FindAndSearchCategoryResponseDto);
  }

  public domainToResponsePaginateDto(source: ResponsePaginate<Category>): ResponsePaginate<CategoryDto> {
    return {
      data: this.domainsToDtos(source.data),
      count: source.count
    };
  }

  public domainToDto(source: Category): CategoryDto {
    return this.classMapper.map(source, Category, CategoryDto);
  }

  public dtoToDomain(source: CategoryDto): Category {
    return this.classMapper.map(source, CategoryDto, Category);
  }

  public domainsToDtos(source: Category[]): CategoryDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Category, CategoryDto);
  }

  public dtosToDomains(source: CategoryDto[]): Category[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, CategoryDto, Category);
  }

  public createDtoToDomain(source: CreateCategoryDto): Category {
    return this.classMapper.map(source, CreateCategoryDto, Category);
  }

  public updateDtoToDomain(source: UpdateCategoryDto): Category {
    return this.classMapper.map(source, UpdateCategoryDto, Category);
  }

  public queryDtoToDomain(source: QueryDto<CategoryDto>): Query<Category> {
    const query: Query<Category> = new Query<Category>();
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

  public domainsToQueries(source: Category[]): any[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Category, Object);
  }
}
