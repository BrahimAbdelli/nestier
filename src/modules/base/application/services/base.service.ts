import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PaginationConstants } from '@shared/common/constants';
import { EntityNotFoundDomainException } from '@shared/common/error-handling/domain/exceptions/entity-not-found.exception';
import { CollectionNotFoundException } from '@shared/common/error-handling/infrastructure/exceptions';
import { Logger } from '@shared/common/logger/logger.service';
import { Attribute } from '@shared/common/search';
import { Query } from '@shared/common/search/domains/query';
import { SearchResponse } from '@shared/common/search/domains/search-response';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { ObjectId } from 'mongodb';
import { IGetUserAuthInfoRequest } from '../../../../modules/user/domain/value-objects/user-request.interface';
import { BaseServiceInterface } from '../../application/ports/base-service.interface';
import { FindAndCountCriteria } from '../../domain/ports/find-and-count.criteria';
import { BaseRepository } from '../../domain/repositories/base.repository';
import { Base } from '../../domain/value-objects/base';

@Injectable()
export class BaseService<D extends Base> implements BaseServiceInterface<D> {
  constructor(
    @Inject(BaseRepository) private readonly baseRepository: BaseRepository<D>,
    @Inject(REQUEST) public readonly request: IGetUserAuthInfoRequest,
    protected readonly logger: Logger
  ) {}

  public findAll(): Promise<D[]> {
    return this.baseRepository.findAll();
  }

  public async findOneById(id: string): Promise<D> {
    const entity: D = await this.baseRepository.findOneById(this.toIdString(id));
    if (!entity) {
      this.logger.error('Entity not found', { _id: id });
      throw new EntityNotFoundDomainException();
    }
    return entity;
  }

  public async findAndCount(criteria: FindAndCountCriteria): Promise<ResponsePaginate<D>> {
    const [result, total] = await this.baseRepository.findAndCount(criteria);
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
    const id: string = this.toIdString(domain._id);
    const existingDomain: D = await this.baseRepository.findOneById(id);
    if (!existingDomain) {
      this.logger.error('Entity not found', { _id: domain._id });
      throw new EntityNotFoundDomainException();
    }

    if (this.request.user) {
      domain.userUpdated = this.request.user._id;
    }

    const updatedEntity: D = { ...existingDomain, ...domain, _id: domain._id };
    return this.baseRepository.save(updatedEntity);
  }

  public async delete(id: string): Promise<void> {
    const idString: string = this.toIdString(id);
    const entity: D = await this.baseRepository.findOneById(idString);
    if (!entity) {
      this.logger.error('Entity not found', { _id: id });
      throw new EntityNotFoundDomainException();
    }
    await this.baseRepository.delete(idString);
  }

  public async softDelete(id: string, isDeleted: boolean): Promise<void> {
    const idString: string = this.toIdString(id);
    const existingEntity: D = await this.baseRepository.findOneById(idString);
    if (!existingEntity) {
      this.logger.error('Entity not found', { _id: id });
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
      const errorMessage: string = error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.logQueryError('An error occurred:', errorMessage);
      throw error;
    }
  }

  public paginate(take: number, skip: number): Promise<ResponsePaginate<D>> {
    const queryTake: number = take || PaginationConstants.DEFAULT_TAKE;
    const querySkip: number = skip || PaginationConstants.DEFAULT_SKIP;
    const criteria: FindAndCountCriteria = {
      onlyNotDeleted: true,
      take: queryTake,
      skip: querySkip,
    };
    return this.findAndCount(criteria);
  }

  public async search(queryData: Query<D>): Promise<SearchResponse<D>> {
    const pagination: { take?: number; skip?: number } = this.buildPagination(queryData);
    const criteria: FindAndCountCriteria = {
      onlyNotDeleted: false,
      attributes: queryData.attributes.map((attribute: Attribute) => ({
        key: attribute.key,
        value: attribute.value,
        comparator: attribute.comparator,
      })),
      comparisonType: queryData.type,
      order: queryData.orders as Record<string, string>,
      ...pagination,
    };

    const { data, count }: ResponsePaginate<D> = await this.findAndCount(criteria);
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

  private toIdString(id: string | ObjectId): string {
    if (id instanceof ObjectId) {
      return id.toHexString();
    }
    return String(id);
  }
}
