import { Inject, Injectable } from '@nestjs/common';
import { UserEmailInterface, USER_EMAIL_INTERFACE } from '../../domain/ports/email.interface';
import { UserResetPasswordRequest } from '../../domain/value-objects/user-reset-password-request';
import { User } from '../../domain/value-objects/user';
import { UserResetPasswordRequestContext } from '../../domain/value-objects/user-reset-password-request-context';
import { EmailTemplateService, EmailTemplate } from '@shared/common/email';

export class SendPasswordResetEmailRequest {
  public user: User;
  public resetToken: string;
  public context: UserResetPasswordRequestContext;

  public static create(): SendPasswordResetEmailRequestBuilder {
    return new SendPasswordResetEmailRequestBuilder();
  }
}

export class SendPasswordResetEmailRequestBuilder {
  private request: SendPasswordResetEmailRequest = new SendPasswordResetEmailRequest();

  public withUser(user: User): this {
    this.request.user = user;
    return this;
  }

  public withResetToken(resetToken: string): this {
    this.request.resetToken = resetToken;
    return this;
  }

  public withContext(context: UserResetPasswordRequestContext): this {
    this.request.context = context;
    return this;
  }

  public build(): SendPasswordResetEmailRequest {
    return this.request;
  }
}

@Injectable()
export class SendPasswordResetEmailUseCase {
  constructor(
    @Inject(USER_EMAIL_INTERFACE) private readonly userEmailInterface: UserEmailInterface,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  public async execute(request: SendPasswordResetEmailRequest): Promise<void> {
    const templateData = {
      username: request.user.username,
      email: request.user.email,
      actionUrl: request.context.actionUrl,
      supportEmail: request.context.supportEmail,
      browserName: request.context.browserName,
      ip: request.context.ip,
    };

    const template: EmailTemplate = this.emailTemplateService.generatePasswordResetTemplate(templateData);

    const emailRequest: UserResetPasswordRequest = new UserResetPasswordRequest();
    emailRequest.to = request.user.email;
    emailRequest.toName = `${request.user.username} ${request.user.lastname}`;
    emailRequest.subject = template.subject;
    emailRequest.html = template.html;
    emailRequest.resetToken = request.resetToken;
    emailRequest.actionUrl = request.context.actionUrl;
    emailRequest.supportEmail = request.context.supportEmail;
    emailRequest.expirationTime = request.context.resetPasswordExpiration;

    await this.userEmailInterface.sendPasswordResetEmail(emailRequest);
  }

}
