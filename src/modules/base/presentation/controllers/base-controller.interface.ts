import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { SearchResponseDto } from '@shared/common/search/dtos/search-response.dto';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { Base } from '../../domain/value-objects/base';
import { BaseDto } from '../dtos/dtos/base.dto';

export interface BaseControllerInterface<_D extends Base, B extends BaseDto, CreateDto, UpdateDto, FindAndSearchDto> {
  findAll(): Promise<FindAndSearchDto[]>;
  paginate(take: number, skip: number): Promise<ResponsePaginate<B>>;
  create(createDto: CreateDto): Promise<void>;
  update(id: string, updateDto: UpdateDto): Promise<B>;
  findOne(id: string): Promise<B>;
  archive(id: string): Promise<void>;
  unarchive(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  search(query: QueryDto<B>): Promise<SearchResponseDto<B>>;
}
