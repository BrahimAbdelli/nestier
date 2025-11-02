import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalExceptionFilter } from '@shared/common/error-handling/infrastructure/filters/global-exception.filter';
import { ErrorMapperService } from '@shared/common/error-handling/infrastructure/mappers/error-mapper.service';
import { testConfiguration } from '../../config/configuration';
import { OrmDatabaseConfig } from '../../config/orm-config';
import { BaseModule } from '../../../modules/base/base.module';
import { CategoryModule } from '../../../modules/category/category.module';
import { ProductModule } from '../../../modules/product/product.module';
import { UserModule } from '../../../modules/user/user.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [testConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useClass: OrmDatabaseConfig,
    }),
    BaseModule,
    UserModule,
    CategoryModule,
    ProductModule,
    AutomapperModule.forRoot({ strategyInitializer: classes() }),
  ],
  controllers: [],
  providers: [
    ErrorMapperService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class TestAppModule {}



