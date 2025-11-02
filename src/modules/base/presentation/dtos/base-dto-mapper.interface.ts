import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Query } from "@shared/common/search/domains/query";
import { QueryDto } from "@shared/common/search/dtos/query.dto";
import { ResponsePaginate } from "@shared/common/types/response-paginate.type";
import { Base } from "../../domain/value-objects/base";
import { BaseDto } from "./dtos/base.dto";

export abstract class BaseDtoMapperInterface<T extends Base, B extends BaseDto, CreateDto extends BaseDto, UpdateDto extends BaseDto, FindAndSearchDto extends BaseDto> {
  public abstract domainToDto(source: T): B;
  public abstract dtoToDomain(source: CreateDto | UpdateDto | FindAndSearchDto): T;
  public abstract domainsToDtos(source: T[]): B[];
  public abstract dtosToDomains(source: (CreateDto | UpdateDto | FindAndSearchDto)[]): T[];
  public abstract domainsToFindAndSearchDtos(source: T[]): FindAndSearchDto[];
  public abstract createDtoToDomain(source: CreateDto): T;
  public abstract updateDtoToDomain(source: UpdateDto): T;
  public abstract queryDtoToDomain(source: QueryDto<B>): Query<T>;
  public abstract domainToResponsePaginateDto(source: ResponsePaginate<T>): ResponsePaginate<B>;

}

export class BaseDtoMapper implements BaseDtoMapperInterface<Base, BaseDto, BaseDto, BaseDto, BaseDto> {

  constructor(
    @InjectMapper() protected readonly classMapper: Mapper,
  ) { }
  public domainsToDtos(source: Base[]): BaseDto[] {
    if (!source) return undefined;
  }

  public domainsToFindAndSearchDtos(source: Base[]): BaseDto[] {
    if (!source) return undefined;
  }

  public dtosToDomains(source: BaseDto[]): Base[] {
    if (!source) return undefined;
  }

  public createDtoToDomain(source: BaseDto): Base {
    if (!source) return undefined;
  }

  public updateDtoToDomain(source: BaseDto): Base {
    if (!source) return undefined;
  }

  public domainToDto(source: Base): BaseDto {
    if (!source) return undefined;
  }

  public dtoToDomain(source: BaseDto): Base {
    if (!source) return undefined;
  }

  public queryDtoToDomain(source: QueryDto<BaseDto>): Query<Base> {
    if (!source) return undefined;
  }

  public domainToResponsePaginateDto(source: ResponsePaginate<Base>): ResponsePaginate<BaseDto> {
    if (!source) return undefined;
  }
}
