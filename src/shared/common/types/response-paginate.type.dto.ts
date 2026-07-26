import { BaseDto } from '../../../modules/base/presentation/dtos/dtos/base.dto';

export type ResponsePaginateDto<B extends BaseDto> = {
  data: B[];
  count: number;
};
