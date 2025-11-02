import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Attribute } from '@shared/common/search/domains/attribute';
import { Query } from '@shared/common/search/domains/query';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { BaseDtoMapperInterface } from '../../../base/presentation/dtos/base-dto-mapper.interface';
import { User } from '../../domain/value-objects/user';
import { UserLogin } from '../../domain/value-objects/user-login';
import { UserUpdatePassword } from '../../domain/value-objects/user-update-password';
import { CreateUserDto, FindAndSearchUserResponseDto, UpdateNewPasswordDto, UpdateUserDto, UserDto, UserLoginDto, UserLoginResponseDto, UserResponseDto } from '../dtos';

@Injectable()
export class UserDtoMapper extends BaseDtoMapperInterface<User, UserDto, CreateUserDto, UpdateUserDto, FindAndSearchUserResponseDto> {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {
    super();
  }

  public domainToDto(source: User): UserDto {
    return this.classMapper.map(source, User, UserDto);
  }

  public dtoToDomain(source: FindAndSearchUserResponseDto): User {
    return this.classMapper.map(source, FindAndSearchUserResponseDto, User);
  }

  public domainsToFindAndSearchDtos(source: User[]): FindAndSearchUserResponseDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, User, FindAndSearchUserResponseDto);
  }

  public domainsToDtos(source: User[]): UserDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, User, UserDto);
  }

  public dtosToDomains(source: FindAndSearchUserResponseDto[]): User[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, FindAndSearchUserResponseDto, User);
  }

  public createDtoToDomain(source: CreateUserDto): User {
    return this.classMapper.map(source, CreateUserDto, User);
  }

  public updateDtoToDomain(source: UpdateUserDto): User {
    return this.classMapper.map(source, UpdateUserDto, User);
  }

  public queryDtoToDomain(source: QueryDto<UserDto>): Query<User> {
    const query = new Query<User>();
    query.take = source.take;
    query.skip = source.skip;
    query.type = source.type;
    query.orders = source.orders;
    query.isPaginable = source.isPaginable;
    query.attributes = source.attributes.map(attr => {
      const attribute = new Attribute();
      attribute.key = attr.key;
      attribute.comparator = attr.comparator;
      attribute.value = attr.value;
      return attribute;
    });
    return query;
  }

  public domainToResponsePaginateDto(source: ResponsePaginate<User>): ResponsePaginate<UserDto> {
    return {
      data: this.domainsToDtos(source.data),
      count: source.count
    };
  }

  // New methods for the new DTOs
  public domainToUserResponseDto(source: User): UserResponseDto {
    return this.classMapper.map(source, User, UserResponseDto);
  }

  public userResponseDtoToDomain(source: UserResponseDto): User {
    return this.classMapper.map(source, UserResponseDto, User);
  }

  public domainToUserLoginResponseDto(source: User): UserLoginResponseDto {
    return this.classMapper.map(source, User, UserLoginResponseDto);
  }

  public domainsToUserResponseDtos(source: User[]): UserResponseDto[] {
    if (source === undefined) {
      return undefined;
    }
    return this.classMapper.mapArray(source, User, UserResponseDto);
  }

  public loginDtoToDomain(source: UserLoginDto): UserLogin {
    return this.classMapper.map(source, UserLoginDto, UserLogin);
  }

  public updatePasswordDtoToDomain(source: UpdateNewPasswordDto): UserUpdatePassword {
    return this.classMapper.map(source, UpdateNewPasswordDto, UserUpdatePassword);
  }
}
