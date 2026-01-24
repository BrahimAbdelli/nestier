import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { FindManyOptions, Repository } from 'typeorm';
import { BaseEntity } from '../../../domain/entities/base.entity';
import { BaseRepository } from '../../../domain/repositories/base.repository';
import { Base } from '../../../domain/value-objects/base';
import { BaseEntityMapperInterface } from '../mappers/base-entity-mapper.interface';
import { Logger } from '@shared/common/logger/logger.service';
import { CollectionNotFoundException } from '@shared/common/error-handling/infrastructure/exceptions';

@Injectable()
export class TypeOrmBaseRepository<E extends BaseEntity, D extends Base>
  implements BaseRepository<E, D> {
  constructor(protected readonly repository: Repository<E>, protected readonly baseEntityMapper: BaseEntityMapperInterface<E, D>, protected readonly logger: Logger) { }

  public async save(domain: D): Promise<D> {
    const entity: E = this.baseEntityMapper.domainToPersistence(domain);
    const savedEntity: E = await this.repository.save(entity);
    return this.baseEntityMapper.persistenceToDomain(savedEntity);
  }

  public async findAll(): Promise<D[]> {
    const entities: E[] = await this.repository.find({ where: { isDeleted: false } as FindManyOptions<E>['where'] });
    return this.baseEntityMapper.persistencesToDomains(entities);
  }

  public async findOneById(_id: ObjectId): Promise<D> {
    const entity: E = await this.repository.findOne({ where: { _id } as FindManyOptions<E>['where'] });
    return this.baseEntityMapper.persistenceToDomain(entity);
  }

  public async findAndCount(options: FindManyOptions<E>): Promise<[D[], number]> {
    const [entities, count] = await this.repository.findAndCount(options);
    const domains: D[] = this.baseEntityMapper.persistencesToDomains(entities);
    return [domains, count];
  }

  public async delete(id: ObjectId): Promise<void> {
    await this.repository.delete(id);
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
}
