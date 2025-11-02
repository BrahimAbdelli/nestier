import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EMAIL_INTERFACE } from '@shared/common/email/domain/ports/email.interface';
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
      provide: EMAIL_INTERFACE,
      useClass: EmailService,
    },
  ],
  exports: [
    EmailService,
    EMAIL_INTERFACE,
  ],
})
export class EmailModule {}
