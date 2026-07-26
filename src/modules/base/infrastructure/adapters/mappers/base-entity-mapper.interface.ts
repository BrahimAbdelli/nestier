import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Base } from '../../../domain/value-objects/base';
import { BaseEntity } from '../../persistence/typeorm/base.entity';

export abstract class BaseEntityMapperInterface<E extends BaseEntity, D extends Base> {
  public abstract domainToPersistence(source: D): E;
  public abstract persistenceToDomain(source: E): D;
  public abstract domainsToPersistences(source: D[]): E[];
  public abstract persistencesToDomains(source: E[]): D[];
}

export class BaseEntityMapper implements BaseEntityMapperInterface<BaseEntity, Base> {
  constructor(@InjectMapper() protected readonly classMapper: Mapper) {}

  public domainToPersistence(source: Base): BaseEntity {
    return null;
  }

  public persistenceToDomain(source: BaseEntity): Base {
    return null;
  }

  public domainsToPersistences(source: Base[]): BaseEntity[] {
    if (!source) return undefined;
  }

  public persistencesToDomains(source: BaseEntity[]): Base[] {
    if (!source) return undefined;
  }
}
