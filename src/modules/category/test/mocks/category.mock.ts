import { faker } from '@faker-js/faker';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { ComparisonTypeEnum } from '@shared/common/search/enums/comparison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { DeepPartial } from '@shared/common/types/deep-partial.type';
import { CategoryEntity } from '../../infrastructure/entities/category.entity';
import { CreateCategoryDto } from '../../presentation/dtos/create-category.dto';
import { CategoryDto } from '../../presentation/dtos';

export function mockCategoryFactory(newCategory: DeepPartial<CreateCategoryDto> = new CreateCategoryDto()): CreateCategoryDto {
  const category: CreateCategoryDto = {
    name: faker.commerce.department(),
    quantity: faker.number.int({ min: 0, max: 1000 }),
    description: faker.commerce.productDescription(),
  };

  return Object.assign(category, newCategory);
}

export function mockCategoryArrayFactory(count: number, overrides: DeepPartial<CreateCategoryDto> = new CreateCategoryDto()): CreateCategoryDto[] {
  return Array.from({ length: count }, () => mockCategoryFactory(overrides));
}

export function mockHighVolumeCategoryFactory(overrides: DeepPartial<CreateCategoryDto> = new CreateCategoryDto()): CreateCategoryDto {
  return mockCategoryFactory({
    quantity: faker.number.int({ min: 1000, max: 10000 }),
    name: faker.commerce.department() + ' (High Volume)',
    ...overrides
  });
}

export function mockEmptyCategoryFactory(overrides: DeepPartial<CreateCategoryDto> = new CreateCategoryDto()): CreateCategoryDto {
  return mockCategoryFactory({
    quantity: 0,
    name: faker.commerce.department() + ' (Empty)',
    ...overrides
  });
}

export function mockCategorySearchCriteriaFactory(
  overrides: Partial<QueryDto<CategoryDto>> = new QueryDto<CategoryDto>()
): QueryDto<CategoryDto> {
  return {
    attributes: [{ key: 'name', value: 'Test', comparator: ComparatorEnum.LIKE }],
    type: ComparisonTypeEnum.AND,
    isPaginable: true,
    take: 10,
    skip: 0,
    orders: {},
    enumValidation: null,
    ...overrides
  };
}
