import { Base } from "../../../modules/base/domain/value-objects/base";

export type ResponsePaginate<T extends Base> = {
  data: T[];
  count: number;
};
