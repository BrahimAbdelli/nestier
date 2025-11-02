import { ObjectId } from 'mongodb';
import { FindManyOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { Base } from '../value-objects/base';

export const BASE_REPOSITORY = Symbol("BASE_REPOSITORY");

export abstract class BaseRepository<E extends BaseEntity, T extends Base> {
  public abstract findAll(): Promise<T[]>;
  public abstract findOneById(id: ObjectId): Promise<T>;
  public abstract findAndCount(options: FindManyOptions<E>): Promise<[T[], number]>;
  public abstract create(domain: T): Promise<void>;
  public abstract save(domain: T): Promise<T>;
  public abstract delete(id: ObjectId): Promise<void>;
  public abstract clear(): Promise<void>;
}
