import { Injectable } from '@nestjs/common';
import {
  SendPasswordResetEmailUseCase,
  SendPasswordResetEmailRequest,
} from '../use-cases/send-password-reset-email.use-case';
import { Logger } from '@shared/common/logger/logger.service';
import { UserResetPasswordRequestContextService } from '../../../../modules/user/application/services/user-reset-password-request-context.service';
import { UserResetPasswordRequestContext } from '../../../../modules/user/domain/value-objects/user-reset-password-request-context';
import { User } from '../../domain/value-objects/user';
import { UserNotificationInterface } from './user-notification.interface';

@Injectable()
export class UserNotificationAdapter implements UserNotificationInterface {
  constructor(
    private readonly sendPasswordResetEmailUseCase: SendPasswordResetEmailUseCase,
    private readonly userResetPasswordRequestContextService: UserResetPasswordRequestContextService,
    private readonly logger: Logger
  ) {}

  public async sendResetPasswordEmail(user: User, resetToken: string): Promise<void> {
    try {
      const context: UserResetPasswordRequestContext =
        this.userResetPasswordRequestContextService.getRequestContext(resetToken);
      const request: SendPasswordResetEmailRequest = SendPasswordResetEmailRequest.create()
        .withUser(user)
        .withResetToken(resetToken)
        .withContext(context)
        .build();

      await this.sendPasswordResetEmailUseCase.execute(request);
    } catch (error: unknown) {
      this.logger.error('Failed to send password reset email', { error });
    }
  }
}
