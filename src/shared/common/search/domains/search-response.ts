import { Base } from '../../../../modules/base/domain/value-objects/base';

export class SearchResponse<D extends Base> {
  count: number;
  page?: number;
  totalPages?: number;
  data: D[];
}
