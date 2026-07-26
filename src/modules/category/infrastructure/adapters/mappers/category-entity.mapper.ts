import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseEntityMapperInterface } from '../../../../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { Category } from '../../../domain/value-objects/category';
import { CategoryEntity } from '../../entities/category.entity';

@Injectable()
export class CategoryEntityMapper implements BaseEntityMapperInterface<CategoryEntity, Category> {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {}

  public domainToPersistence(source: Category): CategoryEntity {
    return this.classMapper.map(source, Category, CategoryEntity);
  }

  public persistenceToDomain(source: CategoryEntity): Category {
    return this.classMapper.map(source, CategoryEntity, Category);
  }

  public domainsToPersistences(source: Category[]): CategoryEntity[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, Category, CategoryEntity);
  }

  public persistencesToDomains(source: CategoryEntity[]): Category[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, CategoryEntity, Category);
  }
}
