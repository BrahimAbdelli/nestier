import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Attribute } from '@shared/common/search/domains/attribute';
import { Query } from '@shared/common/search/domains/query';
import { AttributeDto } from '@shared/common/search/dtos/attribute.dto';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { Category } from '../../domain/value-objects/category';
import { CategoryDto, CreateCategoryDto, FindAndSearchCategoryResponseDto, UpdateCategoryDto } from '../dtos';

@Injectable()
export class CategoryDtoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper): void => {
      createMap(mapper, Category, FindAndSearchCategoryResponseDto);
      createMap(mapper, FindAndSearchCategoryResponseDto, Category);
      createMap(mapper, Category, CategoryDto);
      createMap(mapper, CategoryDto, Category);
      createMap(mapper, Category, CreateCategoryDto);
      createMap(mapper, CreateCategoryDto, Category);
      createMap(mapper, Category, UpdateCategoryDto);
      createMap(mapper, UpdateCategoryDto, Category);
      createMap(mapper, AttributeDto, Attribute);
      createMap(mapper, QueryDto<CategoryDto>, Query<Category>);
    };
  }
}
