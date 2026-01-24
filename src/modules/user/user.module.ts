import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EmailModule } from '@shared/common/email';
import { EmailTemplateService } from '@shared/common/email/domain/services/email-template.service';
import { Logger } from '@shared/common/logger/logger.service';
import { LoggerModule } from '@shared/common/logger/logger.module';
import { Repository } from 'typeorm';
import { BaseRepository } from '../base/domain/repositories/base.repository';
import { BaseEntityMapperInterface } from '../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { TypeOrmBaseRepository } from '../base/infrastructure/adapters/repositories/orm-base.repository';
import { BaseDtoMapperInterface } from '../base/presentation/dtos/base-dto-mapper.interface';
import { UserResetPasswordRequestContextService } from './application/services/user-reset-password-request-context.service';
import { UserService } from './application/services/user.service';
import { SendPasswordResetEmailUseCase } from './application/use-cases/send-password-reset-email.use-case';
import { UserEmailAdapter } from './infrastructure/adapters/email/user-email.adapter';
import { UserRepository, USER_REPOSITORY } from './domain/repositories/user.repository';
import { USER_EMAIL_INTERFACE } from './domain/ports/email.interface';
import { User } from './domain/value-objects/user';
import { TypeOrmUserRepository } from './infrastructure/adapters/repositories/typeorm-user.repository';
import { UserEntity } from './infrastructure/entities/user.entity';
import { UserEntityMapper } from './infrastructure/mappers/user-entity.mapper';
import { UserEntityMapperProfile } from './infrastructure/mappers/user-entity.mapper.profile';
import { AuthMiddleware } from './infrastructure/middleware/authentication.middleware';
import { UserController } from './presentation/controllers/user.controller';
import { UserDtoMapper } from './presentation/mappers/user-dto.mapper';
import { UserDtoMapperProfile } from './presentation/mappers/user-dto.mapper.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule,
    EmailModule,
    LoggerModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserResetPasswordRequestContextService,
    SendPasswordResetEmailUseCase,
    UserEmailAdapter,
    EmailTemplateService,
    UserDtoMapperProfile,
    UserDtoMapper,
    UserEntityMapperProfile,
    {
      provide: BaseRepository,
      inject: [getRepositoryToken(UserEntity), BaseEntityMapperInterface, Logger],
      useFactory: (
        repo: Repository<UserEntity>,
        mapper: BaseEntityMapperInterface<UserEntity, User>,
        logger: Logger,
      ): BaseRepository<UserEntity, User> => {
        return new TypeOrmBaseRepository<UserEntity, User>(repo, mapper, logger);
      },
    },
    {
      provide: USER_REPOSITORY,
      inject: [getRepositoryToken(UserEntity), BaseEntityMapperInterface, Logger],
      useFactory: (
        repo: Repository<UserEntity>,
        mapper: BaseEntityMapperInterface<UserEntity, User>,
        logger: Logger,
      ): UserRepository => {
        return new TypeOrmUserRepository(repo, mapper, logger);
      },
    },
    { provide: BaseEntityMapperInterface, useClass: UserEntityMapper },
    { provide: BaseDtoMapperInterface, useClass: UserDtoMapper },
    { provide: USER_EMAIL_INTERFACE, useClass: UserEmailAdapter },
  ],
  exports: [UserService],
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/*', method: RequestMethod.GET },
        { path: 'users/*', method: RequestMethod.DELETE },
        { path: 'users/*', method: RequestMethod.PUT }
      );
  }
  static readonly entities: EntityClassOrSchema[] = [UserEntity];
}
