import { Base } from '../../../modules/base/domain/value-objects/base';

export type ResponsePaginate<D extends Base> = {
  data: D[];
  count: number;
};
