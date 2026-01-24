import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ApplicationExceptionFilter } from '@shared/common/error-handling/infrastructure/filters/application-exception.filter';
import { Logger } from '@shared/common/logger/logger.service';
import { ValidationPipe } from '@shared/common/pipes';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { join } from 'node:path';
import * as favicon from 'serve-favicon';

export class AppInitializer {
  static initializeApp(app: INestApplication): {
    configService: ConfigService;
    logger: Logger;
  } {

    const configService: ConfigService = app.get(ConfigService);
    const logger: Logger = app.get(Logger);
    app.setGlobalPrefix('api');

    const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .setTitle('Nestier')
      .setDescription('This is a project aimed to be a nestjs boilerplate using hexagonal architecture and generic repository pattern')
      .setVersion('2.0.0')
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/docs', app, document);
    app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ApplicationExceptionFilter());
    app.use(
      compression(),
      helmet(),
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10000, // limit each IP to 100 requests per windowMs
      }),
      favicon(join(__dirname, '..', 'public', 'favicon.ico'))
    );

    return { configService, logger };
  }
}
