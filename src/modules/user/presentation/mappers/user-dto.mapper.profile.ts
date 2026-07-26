import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Attribute } from '@shared/common/search/domains/attribute';
import { Query } from '@shared/common/search/domains/query';
import { AttributeDto } from '@shared/common/search/dtos/attribute.dto';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { User } from '../../domain/value-objects/user';
import { UserLogin } from '../../domain/value-objects/user-login';
import {
  CreateUserDto,
  FindAndSearchUserResponseDto,
  UpdateNewPasswordDto,
  UpdateUserDto,
  UserDto,
  UserLoginDto,
  UserLoginResponseDto,
  UserResponseDto,
} from '../dtos';
import { UserUpdatePassword } from '../../domain/value-objects/user-update-password';

@Injectable()
export class UserDtoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public get profile(): (mapper: Mapper) => void {
    return (mapper: Mapper): void => {
      createMap(mapper, User, FindAndSearchUserResponseDto);
      createMap(mapper, FindAndSearchUserResponseDto, User);
      createMap(mapper, User, UserDto);
      createMap(mapper, UserDto, User);
      createMap(mapper, User, CreateUserDto);
      createMap(mapper, CreateUserDto, User);
      createMap(mapper, User, UpdateUserDto);
      createMap(mapper, UpdateUserDto, User);
      createMap(mapper, User, UserResponseDto);
      createMap(mapper, UserResponseDto, User);
      createMap(mapper, User, UserLoginResponseDto);
      createMap(mapper, UserLoginResponseDto, User);
      createMap(mapper, User, UserLogin);
      createMap(mapper, UserLogin, User);
      createMap(mapper, AttributeDto, Attribute);
      createMap(mapper, QueryDto<UserDto>, Query<User>);
      createMap(mapper, UserLogin, UserLoginDto);
      createMap(mapper, UserLoginDto, UserLogin);
      createMap(mapper, UpdateNewPasswordDto, UserUpdatePassword);
    };
  }
}
