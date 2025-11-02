import { Query } from '@shared/common/search/domains/query';
import { SearchResponse } from '@shared/common/search/domains/search-response';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { ObjectId } from 'mongodb';
import { Base } from '../../domain/value-objects/base';

export abstract class BaseServiceInterface<T extends Base> {
  public abstract findAll(): Promise<T[]>;
  public abstract paginate(take: number, skip: number): Promise<ResponsePaginate<T>>;
  public abstract create(model: T): Promise<void>;
  public abstract update(model: T): Promise<T>;
  public abstract findOneById(_id: ObjectId): Promise<T>;
  public abstract softDelete(_id: ObjectId, isDeleted: boolean): Promise<void>;
  public abstract delete(_id: ObjectId): Promise<void>;
  public abstract clear(): Promise<void>;
  public abstract search(data: Query<T>): Promise<SearchResponse<T>>;
}

