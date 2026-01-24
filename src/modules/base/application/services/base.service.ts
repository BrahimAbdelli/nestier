import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PaginationConstants } from '@shared/common/constants';
import { EntityNotFoundDomainException } from '@shared/common/error-handling/domain/exceptions/entity-not-found.exception';
import { CollectionNotFoundException } from '@shared/common/error-handling/infrastructure/exceptions';
import { Logger } from '@shared/common/logger/logger.service';
import { Query } from '@shared/common/search/domains/query';
import { SearchResponse } from '@shared/common/search/domains/search-response';
import { ComparisonTypeEnum } from '@shared/common/search/enums/comparison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { ObjectId } from 'mongodb';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { IGetUserAuthInfoRequest } from '../../../../modules/user/domain/value-objects/user-request.interface';
import { BaseServiceInterface } from '../../application/ports/base-service.interface';
import { BaseEntity } from '../../domain/entities/base.entity';
import { BaseRepository } from '../../domain/repositories/base.repository';
import { Base } from '../../domain/value-objects/base';

@Injectable()
export class BaseService<E extends BaseEntity, D extends Base>
  implements BaseServiceInterface<D> {
  constructor(
    @Inject(BaseRepository) private readonly baseRepository: BaseRepository<E, D>,
    @Inject(REQUEST) public readonly request: IGetUserAuthInfoRequest,
    protected readonly logger: Logger,
  ) { }

  public findAll(): Promise<D[]> {
    return this.baseRepository.findAll();
  }

  public async findOneById(_id: ObjectId): Promise<D> {
    const entity: D = await this.baseRepository.findOneById(_id);
    if (!entity) {
      this.logger.error('Entity not found', { _id });
      throw new EntityNotFoundDomainException();
    }
    return entity;
  }

  public async findAndCount(options: FindManyOptions<E>): Promise<ResponsePaginate<D>> {
    const [result, total] = await this.baseRepository.findAndCount(options);
    return {
      data: result,
      count: total,
    };
  }

  public async create(domain: D): Promise<void> {
    domain.isDeleted = false;
    if (this.request.user) {
      domain.userCreated = this.request.user._id;
      domain.userUpdated = this.request.user._id;
    }
    await this.baseRepository.create(domain);
  }

  public async update(domain: D): Promise<D> {
    const existingDomain: D = await this.baseRepository.findOneById(domain._id);
    if (!existingDomain) {
      this.logger.error('Entity not found', { _id: domain._id });
      throw new EntityNotFoundDomainException();
    }

    if (this.request.user) {
      domain.userUpdated = this.request.user._id;
    }

    const updatedEntity: D = { ...existingDomain, ...domain, _id: domain._id };
    const result: D = await this.baseRepository.save(updatedEntity);
    return result;
  }

  public async delete(_id: ObjectId): Promise<void> {
    const entity: D = await this.baseRepository.findOneById(_id);
    if (!entity) {
      this.logger.error('Entity not found', { _id });
      throw new EntityNotFoundDomainException();
    }
    await this.baseRepository.delete(_id);
  }

  public async softDelete(_id: ObjectId, isDeleted: boolean): Promise<void> {
    const existingEntity: D = await this.baseRepository.findOneById(_id);
    if (!existingEntity) {
      this.logger.error('Entity not found', { _id });
      throw new EntityNotFoundDomainException();
    }

    existingEntity.isDeleted = isDeleted;

    if (this.request.user) {
      existingEntity.userUpdated = this.request.user._id;
    }
    await this.baseRepository.save(existingEntity);
  }

  public async clear(): Promise<void> {
    try {
      await this.baseRepository.clear();
    } catch (error: unknown) {
      if (error instanceof CollectionNotFoundException) {
        this.logger.logQueryError('Collection does not exist. Unable to clear.', error.message);
        return;
      }
      const errorMessage: string = error instanceof Error
        ? error.message
        : JSON.stringify(error);
      this.logger.logQueryError('An error occurred:', errorMessage);
      throw error;
    }
  }

  public async paginate(take: number, skip: number): Promise<ResponsePaginate<D>> {
    const queryTake: number = take || PaginationConstants.DEFAULT_TAKE;
    const querySkip: number = skip || PaginationConstants.DEFAULT_SKIP;
    const options: FindManyOptions<E> = {
      where: {
        isDeleted: false,
      } as FindOptionsWhere<E>,
      take: queryTake,
      skip: querySkip,
      ...(take || skip ? { take, skip } : {}),
    };
    const { data, count }: ResponsePaginate<D> = await this.findAndCount(options);
    return {
      data,
      count,
    };
  }

  public async search(queryData: Query<D>): Promise<SearchResponse<D>> {
    const pagination: { take?: number; skip?: number } = this.buildPagination(queryData);
    const whereClause: FindOptionsWhere<E>[] = this.buildWhereClause(queryData);

    const { data, count }: ResponsePaginate<D> = await this.findAndCount({
      where: whereClause,
      order: queryData.orders as FindOptionsOrder<E>,
      ...pagination,
    });

    return this.buildSearchResponse(data, count, queryData, pagination);
  }

  private buildPagination(queryData: Query<D>): { take?: number; skip?: number } {
    const isPaginable: boolean = queryData.isPaginable !== false;
    if (!isPaginable) {
      return {};
    }

    return {
      take: +queryData.take || PaginationConstants.DEFAULT_TAKE,
      skip: +queryData.skip || PaginationConstants.DEFAULT_SKIP,
    };
  }

  private buildWhereClause(queryData: Query<D>): FindOptionsWhere<E>[] {
    const filterCriteria = queryData.attributes.map((attribute) => ({
      [attribute.key]: this.buildFilterValue(attribute),
    }));

    const isAndQuery: boolean = queryData.type.toUpperCase() === ComparisonTypeEnum.AND;
    const whereCondition: any = isAndQuery ? { $and: filterCriteria } : { $or: filterCriteria };
    return whereCondition as FindOptionsWhere<E>[];
  }

  private buildFilterValue(attribute: { comparator: ComparatorEnum; value: any }): any {
    if (attribute.comparator === ComparatorEnum.EQUALS) {
      return attribute.value;
    }
    if (attribute.comparator === ComparatorEnum.LIKE) {
      return new RegExp(`^${attribute.value}`, 'i');
    }
    return attribute.value;
  }

  private buildSearchResponse(
    data: D[],
    count: number,
    queryData: Query<D>,
    pagination: { take?: number; skip?: number }
  ): SearchResponse<D> {
    const isPaginable: boolean = queryData.isPaginable !== false;

    const response: SearchResponse<D> = { data, count };

    if (isPaginable && pagination.take && pagination.skip !== undefined) {
      response.page = pagination.skip;
      response.totalPages = this.calculateTotalPages(count, pagination.take);
    }

    return response;
  }

  private calculateTotalPages(count: number, take: number): number {
    if (count === take) {
      return Math.trunc(count / take);
    }
    return Math.trunc(count / take + 1);
  }
}
