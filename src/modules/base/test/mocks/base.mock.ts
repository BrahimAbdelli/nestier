import { QueryDto } from "@shared/common/search/dtos/query.dto";
import { ComparaisonTypeEnum } from "@shared/common/search/enums/comparaison.enum";
import { ComparatorEnum } from "@shared/common/search/enums/comparator.enum";

export function mockQueryDtoFactory<T>(newQueryDto: Partial<QueryDto<T>> = new QueryDto<T>()): QueryDto<T> {
  const queryDto: QueryDto<T> = new QueryDto<T>();
  queryDto.attributes = [{ key: 'name', value: 'Test', comparator: ComparatorEnum.LIKE }];
  queryDto.type = ComparaisonTypeEnum.AND;
  queryDto.isPaginable = true;
  queryDto.take = 10;
  queryDto.skip = 0;
  queryDto.orders = {};
  return Object.assign(queryDto, newQueryDto);
}
