import { Base } from '../value-objects/base';
import { FindAndCountCriteria } from '../ports/find-and-count.criteria';

export abstract class BaseRepository<D extends Base> {
  public abstract findAll(): Promise<D[]>;
  public abstract findOneById(id: string): Promise<D>;
  public abstract findAndCount(criteria: FindAndCountCriteria): Promise<[D[], number]>;
  public abstract create(domain: D): Promise<void>;
  public abstract save(domain: D): Promise<D>;
  public abstract delete(id: string): Promise<void>;
  public abstract clear(): Promise<void>;
}
