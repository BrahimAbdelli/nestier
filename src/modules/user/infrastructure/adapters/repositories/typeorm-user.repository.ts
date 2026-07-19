import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@shared/common/logger/logger.service';
import { BaseEntityMapperInterface } from '../../../../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { TypeOrmBaseRepository } from '../../../../base/infrastructure/adapters/repositories/orm-base.repository';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/value-objects/user';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class TypeOrmUserRepository extends TypeOrmBaseRepository<UserEntity, User> implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
    mapper: BaseEntityMapperInterface<UserEntity, User>,
    logger: Logger
  ) {
    super(repository, mapper, logger);
  }

  public async findByEmail(email: string): Promise<User> {
    const userEntity: UserEntity = await this.repository.findOne({
      where: {
        email,
        isDeleted: false,
      },
    });
    return this.baseEntityMapper.persistenceToDomain(userEntity);
  }

  public async findByUsername(username: string): Promise<User> {
    const userEntity: UserEntity = await this.repository.findOne({
      where: {
        username,
        isDeleted: false,
      },
    });
    return this.baseEntityMapper.persistenceToDomain(userEntity);
  }

  public async findActiveUsers(): Promise<User[]> {
    const entities: UserEntity[] = await this.repository.find({
      where: {
        status: true,
        isDeleted: false,
      },
    });
    return this.baseEntityMapper.persistencesToDomains(entities);
  }
}
