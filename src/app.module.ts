import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { MailerModule } from '@nestjs-modules/mailer';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorMapperService, GlobalExceptionFilter } from '@shared/common/error-handling';
import { join } from 'node:path';
import { BaseModule } from './modules/base/base.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { EmailModule } from '@shared/common/email/infrastructure/modules/email.module';
import { LoggerModule } from '@shared/common/logger/logger.module';
import { configuration, getEnvFilePath, OrmDatabaseConfig } from '@shared/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: getEnvFilePath(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useClass: OrmDatabaseConfig,
    }),

    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          secure: true, // use SSL
          auth: {},
          template: {
            dir: join(__dirname, '..', 'templates'), // from src not dist folder (perhaps needs to change in Prod !!!!!!!)
            /* adapter: new HandlebarsAdapter(), // or new PugAdapter */
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    CacheModule.register(),
    BaseModule,
    UserModule,
    EmailModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Middleware configuration can be added here if needed
  }
}
