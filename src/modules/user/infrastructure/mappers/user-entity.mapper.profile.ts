import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/value-objects/user';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserEntityMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper): void => {
      createMap(mapper, UserEntity, User);
      createMap(mapper, User, UserEntity);
    };
  }
}
