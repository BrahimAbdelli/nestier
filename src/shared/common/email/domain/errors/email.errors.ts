import { ApplicationError } from '@shared/common/error-handling/domain/errors/application-error.interface';

export class EmailErrors {
  public static EMAIL_TEMPLATE_LOAD_ERROR(templateName: string): ApplicationError {
    return {
      code: 'EMAIL_TEMPLATE_LOAD_ERROR',
      status: 500,
      message: `Failed to load email template '${templateName}'`,
    };
  }

  public static EMAIL_SEND_ERROR(): ApplicationError {
    return {
      code: 'EMAIL_SEND_ERROR',
      status: 500,
      message: 'Failed to send email',
    };
  }
}
