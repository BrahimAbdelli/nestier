import { Query } from '@shared/common/search/domains/query';
import { SearchResponse } from '@shared/common/search/domains/search-response';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { Base } from '../../domain/value-objects/base';

export abstract class BaseServiceInterface<D extends Base> {
  public abstract findAll(): Promise<D[]>;
  public abstract paginate(take: number, skip: number): Promise<ResponsePaginate<D>>;
  public abstract create(model: D): Promise<void>;
  public abstract update(model: D): Promise<D>;
  public abstract findOneById(id: string): Promise<D>;
  public abstract softDelete(id: string, isDeleted: boolean): Promise<void>;
  public abstract delete(id: string): Promise<void>;
  public abstract clear(): Promise<void>;
  public abstract search(data: Query<D>): Promise<SearchResponse<D>>;
}
