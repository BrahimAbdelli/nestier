import { faker } from '@faker-js/faker';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { ComparaisonTypeEnum } from '@shared/common/search/enums/comparaison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { DeepPartial } from '@shared/common/types/deep-partial.type';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { UserDto } from '../../presentation/dtos/user.dto';

export function mockUserFactory(newUser: DeepPartial<CreateUserDto> = new CreateUserDto()): CreateUserDto {
  const user: CreateUserDto = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    lastname: faker.person.lastName(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    roles: [faker.helpers.arrayElement(['user', 'admin', 'moderator'])],
    image: faker.image.avatar(),
    about: faker.lorem.sentence(),
  };

  return Object.assign(user, newUser);
}

export function mockUserArrayFactory(count: number, overrides: DeepPartial<CreateUserDto> = new CreateUserDto()): CreateUserDto[] {
  return Array.from({ length: count }, () => mockUserFactory(overrides));
}

export function mockAdminUserFactory(overrides: DeepPartial<CreateUserDto> = new CreateUserDto()): CreateUserDto {
  return mockUserFactory({
    roles: ['admin'],
    username: faker.internet.username() + '_admin',
    ...overrides
  });
}

export function mockRegularUserFactory(overrides: DeepPartial<CreateUserDto> = new CreateUserDto()): CreateUserDto {
  return mockUserFactory({
    roles: ['user'],
    username: faker.internet.username() + '_user',
    ...overrides
  });
}

export function mockUserWithMinimalDataFactory(overrides: DeepPartial<CreateUserDto> = new CreateUserDto()): CreateUserDto {
  return mockUserFactory({
    address: undefined,
    phone: undefined,
    image: undefined,
    about: undefined,
    ...overrides
  });
}

export function mockUserSearchCriteriaFactory(
  overrides: Partial<QueryDto<UserDto>> = new QueryDto<UserDto>()
): QueryDto<UserDto> {
  return {
    attributes: [{ key: 'username', value: 'Test', comparator: ComparatorEnum.LIKE }],
    type: ComparaisonTypeEnum.AND,
    isPaginable: true,
    take: 10,
    skip: 0,
    orders: {},
    enumValidation: null,
    ...overrides
  };
}
