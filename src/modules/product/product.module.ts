import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Logger } from '@shared/common/logger/logger.service';
import { LoggerModule } from '@shared/common/logger/logger.module';
import { Repository } from 'typeorm';
import { BaseServiceInterface } from '../base/application/ports/base-service.interface';
import { BaseModule } from '../base/base.module';
import { BaseRepository } from '../base/domain/repositories/base.repository';
import { BaseEntityMapperInterface } from '../base/infrastructure/adapters/mappers/base-entity-mapper.interface';
import { TypeOrmBaseRepository } from '../base/infrastructure/adapters/repositories/orm-base.repository';
import { BaseDtoMapperInterface } from '../base/presentation/dtos/base-dto-mapper.interface';
import { AuthMiddleware } from '../user/infrastructure/middleware/authentication.middleware';
import { UserModule } from '../user/user.module';
import { ProductService } from './application/services/product.service';
import { FindExpensiveProductsUseCase, FindProductsByNameUseCase } from './application/use-cases';
import { ProductRepository, PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import { Product } from './domain/value-objects/product';
import { ProductEntityMapper } from './infrastructure/adapters/mappers/product-entity.mapper';
import { ProductEntityMapperProfile } from './infrastructure/adapters/mappers/product-entity.mapper.profile';
import { TypeOrmProductRepository } from './infrastructure/adapters/repositories/typeorm-product.repository';
import { ProductEntity } from './infrastructure/entities/product.entity';
import { ProductController } from './presentation/controllers/product.controller';
import { ProductDtoMapper } from './presentation/mappers/product-dto.mapper';
import { ProductDtoMapperProfile } from './presentation/mappers/product-dto.mapper.profile';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), UserModule, BaseModule, LoggerModule],
  providers: [
    FindExpensiveProductsUseCase,
    FindProductsByNameUseCase,
    { provide: BaseServiceInterface, useExisting: ProductService },
    ProductService,

    {
      provide: BaseRepository,
      inject: [getRepositoryToken(ProductEntity), BaseEntityMapperInterface, Logger],
      useFactory: (
        repo: Repository<ProductEntity>,
        mapper: BaseEntityMapperInterface<ProductEntity, Product>,
        logger: Logger,
      ): BaseRepository<Product> => {
        return new TypeOrmBaseRepository<ProductEntity, Product>(repo, mapper, logger);
      },
    },
    {
      provide: PRODUCT_REPOSITORY,
      inject: [getRepositoryToken(ProductEntity), BaseEntityMapperInterface, Logger],
      useFactory: (
        repo: Repository<ProductEntity>,
        mapper: BaseEntityMapperInterface<ProductEntity, Product>,
        logger: Logger,
      ): ProductRepository => {
        return new TypeOrmProductRepository(repo, mapper, logger);
      },
    },
    { provide: BaseEntityMapperInterface, useClass: ProductEntityMapper },
    ProductEntityMapperProfile,
    { provide: BaseDtoMapperInterface, useClass: ProductDtoMapper },
    ProductDtoMapper,
    ProductDtoMapperProfile,
  ],
  controllers: [ProductController],
})
export class ProductModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      //We should append the 'api' from the global prefix because nest still
      //doesn't take it in consideration when excluding
      .exclude({ path: 'api/products/search', method: RequestMethod.GET })
      .forRoutes(
        { path: 'products/*', method: RequestMethod.DELETE },
        { path: 'products/*', method: RequestMethod.PUT },
        { path: 'products', method: RequestMethod.GET },
        { path: 'products/*', method: RequestMethod.GET },
        { path: 'products/*', method: RequestMethod.PATCH },
        { path: 'products', method: RequestMethod.POST }
      );
  }
  static readonly entities: EntityClassOrSchema[] = [ProductEntity];
}
