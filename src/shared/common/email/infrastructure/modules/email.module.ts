import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@shared/common/logger/logger.module';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
  ],
  providers: [
    EmailService,
    {
      provide: 'EmailInterface',
      useClass: EmailService,
    },
  ],
  exports: [
    EmailService,
    'EmailInterface',
  ],
})
export class EmailModule {}
