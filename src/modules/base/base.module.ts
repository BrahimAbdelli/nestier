import { classes } from "@automapper/classes";
import { AutomapperModule } from "@automapper/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "@shared/common/logger/logger.module";
import { Repository } from "typeorm";
import { BaseServiceInterface } from "./application/ports/base-service.interface";
import { BaseService } from "./application/services/base.service";
import { BASE_REPOSITORY } from "./domain/repositories/base.repository";
import { BaseEntityMapper, BaseEntityMapperInterface } from "./infrastructure/adapters/mappers/base-entity-mapper.interface";
import { TypeOrmBaseRepository } from "./infrastructure/adapters/repositories/orm-base.repository";
import { BaseDtoMapper, BaseDtoMapperInterface } from "./presentation/dtos/base-dto-mapper.interface";

@Module({

  imports: [ConfigModule, AutomapperModule.forRoot({ strategyInitializer: classes() }), LoggerModule],
  providers: [
    // Application services
    BaseService,
    { provide: BaseServiceInterface, useClass: BaseService },

    // Infrastructure
    { provide: BASE_REPOSITORY, useClass: TypeOrmBaseRepository },
    { provide: BaseEntityMapperInterface, useClass: BaseEntityMapper },
    { provide: BaseDtoMapperInterface, useClass: BaseDtoMapper },
    Repository,
  ],
  exports: [BaseService, BaseServiceInterface, BaseEntityMapperInterface, BaseDtoMapperInterface],
})
export class BaseModule { }
