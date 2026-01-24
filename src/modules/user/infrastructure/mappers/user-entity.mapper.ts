import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BaseEntityMapperInterface } from '../../../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { User } from '../../domain/value-objects/user';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserEntityMapper extends BaseEntityMapperInterface<UserEntity, User> {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {
    super();
  }

  public domainToPersistence(source: User): UserEntity {
    return this.classMapper.map(source, User, UserEntity);
  }

  public persistenceToDomain(source: UserEntity): User {
    return this.classMapper.map(source, UserEntity, User);
  }

  public persistencesToDomains(source: UserEntity[]): User[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, UserEntity, User);
  }

  public domainsToPersistences(source: User[]): UserEntity[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, User, UserEntity);
  }
}

