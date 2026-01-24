import { ObjectId } from 'mongodb';
import { FindManyOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { Base } from '../value-objects/base';

export abstract class BaseRepository<E extends BaseEntity, D extends Base> {
  public abstract findAll(): Promise<D[]>;
  public abstract findOneById(id: ObjectId): Promise<D>;
  public abstract findAndCount(options: FindManyOptions<E>): Promise<[D[], number]>;
  public abstract create(domain: D): Promise<void>;
  public abstract save(domain: D): Promise<D>;
  public abstract delete(id: ObjectId): Promise<void>;
  public abstract clear(): Promise<void>;
}
