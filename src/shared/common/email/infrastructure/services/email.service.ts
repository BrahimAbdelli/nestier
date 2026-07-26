import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@shared/common/logger/logger.service';
import * as Mailjet from 'node-mailjet';
import { ConfigMailjetModel } from '../../../../config/models/config-mailjet.model';
import { ApplicationException } from '../../../error-handling/domain/exceptions/application.exception';
import { EmailSenderInterface } from '../../domain/ports/email-sender.interface';
import { GenericEmailData } from '../../domain/value-objects/generic-email-data';
import { MailjetMessageBuilder } from '../../domain/builders/mailjet-message.builder';
import { EmailErrors } from '../../domain/errors/email.errors';

@Injectable()
export class EmailService implements EmailSenderInterface {
  private readonly mailjet: Mailjet.Client;
  private readonly mailjetConfig: ConfigMailjetModel;

  constructor(
    private readonly configService: ConfigService,
    private logger: Logger
  ) {
    this.mailjetConfig = configService.get<ConfigMailjetModel>('mailjet');
    this.mailjet = new Mailjet.Client({
      apiKey: this.mailjetConfig.apiKey,
      apiSecret: this.mailjetConfig.secretKey,
    });
  }

  public async sendEmail(emailData: GenericEmailData): Promise<void> {
    try {
      const message: Record<string, unknown> = MailjetMessageBuilder.create()
        .withFrom(this.mailjetConfig.mail, this.mailjetConfig.companyName)
        .withTo(emailData.to, emailData.toName)
        .withSubject(emailData.subject)
        .withContent(emailData.html, emailData.text)
        .build();

      await this.mailjet.post('send', { version: this.mailjetConfig.version }).request({
        Messages: [message],
      });
    } catch (error: unknown) {
      this.logger.error('Error sending email', { error });
      throw new ApplicationException(EmailErrors.EMAIL_SEND_ERROR());
    }
  }
}
