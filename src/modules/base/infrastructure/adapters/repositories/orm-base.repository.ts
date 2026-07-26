import { Injectable } from '@nestjs/common';
import { CollectionNotFoundException } from '@shared/common/error-handling/infrastructure/exceptions';
import { Logger } from '@shared/common/logger/logger.service';
import { ComparisonTypeEnum } from '@shared/common/search/enums/comparison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { ObjectId } from 'mongodb';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { FindAndCountAttribute, FindAndCountCriteria } from '../../../domain/ports/find-and-count.criteria';
import { BaseRepository } from '../../../domain/repositories/base.repository';
import { Base } from '../../../domain/value-objects/base';
import { BaseEntity } from '../../persistence/typeorm/base.entity';
import { BaseEntityMapperInterface } from '../mappers/base-entity-mapper.interface';

@Injectable()
export class TypeOrmBaseRepository<E extends BaseEntity, D extends Base> implements BaseRepository<D> {
  constructor(
    protected readonly repository: Repository<E>,
    protected readonly baseEntityMapper: BaseEntityMapperInterface<E, D>,
    protected readonly logger: Logger
  ) {}

  public async save(domain: D): Promise<D> {
    const entity: E = this.baseEntityMapper.domainToPersistence(domain);
    const savedEntity: E = await this.repository.save(entity);
    return this.baseEntityMapper.persistenceToDomain(savedEntity);
  }

  public async findAll(): Promise<D[]> {
    const entities: E[] = await this.repository.find({ where: { isDeleted: false } as FindManyOptions<E>['where'] });
    return this.baseEntityMapper.persistencesToDomains(entities);
  }

  public async findOneById(id: string): Promise<D> {
    const objectId: ObjectId = new ObjectId(id);
    const entity: E = await this.repository.findOne({
      where: { _id: objectId } as FindOptionsWhere<E>,
    });
    return this.baseEntityMapper.persistenceToDomain(entity);
  }

  public async findAndCount(criteria: FindAndCountCriteria): Promise<[D[], number]> {
    const options: FindManyOptions<E> = this.toFindManyOptions(criteria);
    const [entities, count] = await this.repository.findAndCount(options);
    const domains: D[] = this.baseEntityMapper.persistencesToDomains(entities);
    return [domains, count];
  }

  public async delete(id: string): Promise<void> {
    const objectId: ObjectId = new ObjectId(id);
    await this.repository.delete({ _id: objectId } as FindOptionsWhere<E>);
  }

  public async create(domain: D): Promise<void> {
    const entity: E = this.baseEntityMapper.domainToPersistence(domain);
    await this.repository.save(entity);
  }

  public async clear(): Promise<void> {
    try {
      await this.repository.clear();
    } catch (error: any) {
      if ((error.name === 'MongoError' || error.name === 'MongoServerError') && error.code === 26) {
        throw new CollectionNotFoundException(this.repository.metadata.tableName);
      }
      throw error;
    }
  }

  private toFindManyOptions(criteria: FindAndCountCriteria): FindManyOptions<E> {
    const options: FindManyOptions<E> = {};

    if (criteria.take !== undefined) {
      options.take = criteria.take;
    }
    if (criteria.skip !== undefined) {
      options.skip = criteria.skip;
    }
    if (criteria.order) {
      options.order = criteria.order as FindOptionsOrder<E>;
    }

    if (criteria.attributes?.length) {
      options.where = this.buildWhereClause(criteria) as FindOptionsWhere<E>[];
    } else if (criteria.onlyNotDeleted) {
      options.where = { isDeleted: false } as FindOptionsWhere<E>;
    }

    return options;
  }

  private buildWhereClause(criteria: FindAndCountCriteria): FindOptionsWhere<E>[] {
    const filterCriteria = criteria.attributes.map((attribute: FindAndCountAttribute) => ({
      [attribute.key]: this.buildFilterValue(attribute),
    }));

    const isAndQuery: boolean = (criteria.comparisonType || '').toUpperCase() === ComparisonTypeEnum.AND;
    const whereCondition: unknown = isAndQuery ? { $and: filterCriteria } : { $or: filterCriteria };
    return whereCondition as FindOptionsWhere<E>[];
  }

  private buildFilterValue(attribute: FindAndCountAttribute): unknown {
    if (attribute.comparator === ComparatorEnum.EQUALS) {
      return attribute.value;
    }
    if (attribute.comparator === ComparatorEnum.LIKE) {
      const pattern: string = this.toSearchPattern(attribute.value);
      return new RegExp(`^${pattern}`, 'i');
    }
    return attribute.value;
  }

  private toSearchPattern(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }
    if (value === null || value === undefined) {
      return '';
    }
    return JSON.stringify(value);
  }
}
