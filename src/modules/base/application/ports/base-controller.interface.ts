import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { SearchResponseDto } from '@shared/common/search/dtos/search-response.dto';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { ObjectId } from 'mongodb';
import { Base } from '../../domain/value-objects/base';
import { BaseDto } from '../../presentation/dtos/dtos/base.dto';

export interface BaseControllerInterface<T extends Base, B extends BaseDto, CreateDto, UpdateDto, FindAndSearchDto> {
  findAll(): Promise<FindAndSearchDto[]>;
  paginate(take: number, skip: number): Promise<ResponsePaginate<B>>;
  create(createDto: CreateDto): Promise<void>;
  update(_id: ObjectId, updateDto: UpdateDto): Promise<B>;
  findOne(_id: ObjectId): Promise<T>;
  archive(_id: ObjectId): Promise<void>;
  unarchive(_id: ObjectId): Promise<void>;
  delete(_id: ObjectId): Promise<void>;
  clear(): Promise<void>;
  search(query: QueryDto<B>): Promise<SearchResponseDto<B>>;
}
