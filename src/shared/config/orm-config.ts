import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { Logger } from '@shared/common/logger/logger.service';

@Injectable()
export class OrmDatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService, private loggerService: Logger) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.configService.get('database'),
      logger: this.loggerService,
    };
  }
}
