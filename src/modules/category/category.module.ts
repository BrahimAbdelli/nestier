import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Logger } from '@shared/common/logger/logger.service';
import { LoggerModule } from '@shared/common/logger/logger.module';
import { Repository } from 'typeorm';
import { BaseServiceInterface } from '../base/application/ports/base-service.interface';
import { BaseModule } from '../base/base.module';
import { BASE_REPOSITORY, BaseRepository } from '../base/domain/repositories/base.repository';
import { BaseEntityMapperInterface } from '../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { TypeOrmBaseRepository } from '../base/infrastructure/adapters/repositories/orm-base.repository';
import { BaseDtoMapperInterface } from '../base/presentation/dtos/base-dto-mapper.interface';
import { AuthMiddleware } from '../user/infrastructure/middleware/authentification.middelware';
import { UserModule } from '../user/user.module';
import { CategoryService } from './application/services/category.service';
import { Category } from './domain/value-objects/category';
import { CategoryEntityMapper } from './infrastructure/adapters/mappers/category-entity.mapper';
import { CategoryEntityMapperProfile } from './infrastructure/adapters/mappers/category-entity.mapper.profile';
import { CategoryEntity } from './infrastructure/entities/category.entity';
import { CategoryController } from './presentation/controllers/category.controller';
import { CategoryDtoMapper } from './presentation/mappers/category-dto.mapper';
import { CategoryDtoMapperProfile } from './presentation/mappers/category-dto.mapper.profile';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), UserModule, BaseModule, LoggerModule],
  providers: [
    { provide: BaseServiceInterface, useExisting: CategoryService },
    CategoryService,
    {
      provide: BASE_REPOSITORY,
      inject: [getRepositoryToken(CategoryEntity), BaseEntityMapperInterface, Logger],
      useFactory: (
        repo: Repository<CategoryEntity>,
        mapper: BaseEntityMapperInterface<CategoryEntity, Category>,
        logger: Logger,
      ): BaseRepository<CategoryEntity, Category> => {
        return new TypeOrmBaseRepository<CategoryEntity, Category>(repo, mapper, logger);
      },
    },
    { provide: BaseEntityMapperInterface, useClass: CategoryEntityMapper },
    CategoryEntityMapperProfile,
    { provide: BaseDtoMapperInterface, useClass: CategoryDtoMapper },
    CategoryDtoMapper,
    CategoryDtoMapperProfile,
  ],
  controllers: [CategoryController],
})
export class CategoryModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes();
  }
  static readonly entities: EntityClassOrSchema[] = [CategoryEntity];
}
