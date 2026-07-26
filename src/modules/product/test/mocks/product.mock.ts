import { faker } from '@faker-js/faker';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { ComparisonTypeEnum } from '@shared/common/search/enums/comparison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { DeepPartial } from '@shared/common/types/deep-partial.type';
import { mockQueryDtoFactory } from '../../../base/test/mocks/base.mock';
import { ProductDto } from '../../presentation/dtos';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';

export function mockProductFactory(
  newProduct: DeepPartial<CreateProductDto> = new CreateProductDto()
): CreateProductDto {
  const product: CreateProductDto = {
    name: faker.commerce.productName(),
    price: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    description: faker.commerce.productDescription(),
  };

  return Object.assign(product, newProduct);
}

export function mockProductArrayFactory(
  count: number,
  overrides: DeepPartial<CreateProductDto> = new CreateProductDto()
): CreateProductDto[] {
  return Array.from({ length: count }, () => mockProductFactory(overrides));
}

export function mockExpensiveProductFactory(
  overrides: DeepPartial<CreateProductDto> = new CreateProductDto()
): CreateProductDto {
  return mockProductFactory({
    price: faker.number.float({ min: 1000, max: 10000, fractionDigits: 2 }),
    name: faker.commerce.productName() + ' (Premium)',
    ...overrides,
  });
}

export function mockCheapProductFactory(
  overrides: DeepPartial<CreateProductDto> = new CreateProductDto()
): CreateProductDto {
  return mockProductFactory({
    price: faker.number.float({ min: 0.01, max: 10, fractionDigits: 2 }),
    name: faker.commerce.productName() + ' (Budget)',
    ...overrides,
  });
}

export function mockProductSearchCriteriaFactory(
  overrides: Partial<QueryDto<ProductDto>> = new QueryDto<ProductDto>()
): QueryDto<ProductDto> {
  return mockQueryDtoFactory<ProductDto>({
    attributes: [{ key: 'name', value: 'Test', comparator: ComparatorEnum.LIKE }],
    type: ComparisonTypeEnum.AND,
    isPaginable: true,
    take: 10,
    skip: 0,
    orders: {},
    ...overrides,
  });
}
