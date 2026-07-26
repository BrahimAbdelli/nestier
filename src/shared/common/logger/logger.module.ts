import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from './logger.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [Logger, { provide: 'LoggerInterface', useClass: Logger }],
  exports: [Logger, 'LoggerInterface'],
})
export class LoggerModule {}
