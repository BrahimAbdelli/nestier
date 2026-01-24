import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppInitializer } from './app.initializer';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const { configService, logger } = AppInitializer.initializeApp(app);
  try {
    await app.listen(configService.get<string>('server.port'), configService.get<string>('server.hostname'));
    logger.log(`Listening on port ${configService.get<string>('server.port')}`);
  } catch (e) {
    logger.error(`Server cannot be started on port ${configService.get<string>('server.port')}`, e);
  }
}
bootstrap();
