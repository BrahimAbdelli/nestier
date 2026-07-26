import { Injectable } from '@nestjs/common';
import { UserEmailInterface } from '../../../domain/ports/email.interface';
import { UserResetPasswordRequest } from '../../../domain/value-objects/user-reset-password-request';
import { EmailService } from '@shared/common/email/infrastructure/services/email.service';
import { Logger } from '@shared/common/logger/logger.service';
import { GenericEmailData } from '@shared/common/email/domain/value-objects/generic-email-data';

@Injectable()
export class UserEmailAdapter implements UserEmailInterface {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger
  ) {}

  public async sendPasswordResetEmail(request: UserResetPasswordRequest): Promise<void> {
    try {
      const genericEmailRequest: GenericEmailData = GenericEmailData.create()
        .withTo(request.to, request.toName)
        .withSubject(request.subject)
        .withContent(request.html, request.text)
        .build();

      await this.emailService.sendEmail(genericEmailRequest);
      this.logger.log(`Password reset email sent to ${request.to}`);
    } catch (error: unknown) {
      this.logger.error('Failed to send password reset email', { error, email: request.to });
      throw error;
    }
  }
}
