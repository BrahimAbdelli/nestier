import { Base } from "../../../../modules/base/domain/value-objects/base";

export class SearchResponse<T extends Base> {
  count: number;
  page?: number;
  totalPages?: number;
  data: T[];
}
