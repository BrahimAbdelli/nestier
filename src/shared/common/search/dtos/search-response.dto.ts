import { BaseDto } from '../../../../modules/base/presentation/dtos/dtos/base.dto';

export class SearchResponseDto<B extends BaseDto> {
  count: number;
  page?: number;
  totalPages?: number;
  data: B[];
}
