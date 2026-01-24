import { ApplicationError } from '@shared/common/error-handling/domain/errors/application-error.interface';
import { EmailErrors } from './email.errors';

describe('EmailErrors', () => {
  describe('EMAIL_TEMPLATE_LOAD_ERROR', () => {
    it('500 EMAIL_TEMPLATE_LOAD_ERROR - should create error with correct structure', () => {
      const errorEmailTemplateLoadError: ApplicationError = EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('reset-password');

      expect(errorEmailTemplateLoadError.code).toBe('EMAIL_TEMPLATE_LOAD_ERROR');
      expect(errorEmailTemplateLoadError.status).toBe(500);
      expect(errorEmailTemplateLoadError.message).toBe("Failed to load email template 'reset-password'");
    });

    it('should include template name in message', () => {
      const templateNames: string[] = ['welcome', 'verification', 'password-reset', 'notification'];

      for (const templateName of templateNames) {
        const errorEmailTemplateLoadError: ApplicationError = EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR(templateName);

        expect(errorEmailTemplateLoadError.message).toContain(templateName);
        expect(errorEmailTemplateLoadError.message).toContain('Failed to load email template');
      }
    });

    it('should handle template names with special characters', () => {
      const errorEmailTemplateLoadError: ApplicationError = EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('user-confirmation-2024');

      expect(errorEmailTemplateLoadError.message).toBe("Failed to load email template 'user-confirmation-2024'");
    });

    it('should handle empty template name', () => {
      const errorEmailTemplateLoadError: ApplicationError = EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('');

      expect(errorEmailTemplateLoadError.message).toBe("Failed to load email template ''");
      expect(errorEmailTemplateLoadError.code).toBe('EMAIL_TEMPLATE_LOAD_ERROR');
    });
  });

  describe('EMAIL_SEND_ERROR', () => {
    it('500 EMAIL_SEND_ERROR - should create error with correct structure', () => {
      const errorEmailSendError: ApplicationError = EmailErrors.EMAIL_SEND_ERROR();

      expect(errorEmailSendError.code).toBe('EMAIL_SEND_ERROR');
      expect(errorEmailSendError.status).toBe(500);
      expect(errorEmailSendError.message).toBe('Failed to send email');
    });

    it('should have consistent error structure', () => {
      const errorEmailSendError: ApplicationError = EmailErrors.EMAIL_SEND_ERROR();

      expect(errorEmailSendError).toHaveProperty('code');
      expect(errorEmailSendError).toHaveProperty('status');
      expect(errorEmailSendError).toHaveProperty('message');
    });

    it('should return same error structure on multiple calls', () => {
      const errorEmailSendErrorFirst: ApplicationError = EmailErrors.EMAIL_SEND_ERROR();
      const errorEmailSendErrorSecond: ApplicationError = EmailErrors.EMAIL_SEND_ERROR();

      expect(errorEmailSendErrorFirst.code).toBe(errorEmailSendErrorSecond.code);
      expect(errorEmailSendErrorFirst.status).toBe(errorEmailSendErrorSecond.status);
      expect(errorEmailSendErrorFirst.message).toBe(errorEmailSendErrorSecond.message);
    });
  });

  describe('Error consistency', () => {
    it('should always return ApplicationError interface', () => {
      const allEmailErrors: ApplicationError[] = [
        EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('test'),
        EmailErrors.EMAIL_SEND_ERROR(),
      ];

      for (const currentError of allEmailErrors) {
        expect(currentError).toHaveProperty('code');
        expect(currentError).toHaveProperty('status');
        expect(currentError).toHaveProperty('message');
      }
    });

    it('should have unique error codes', () => {
      const errorEmailTemplateLoadError: ApplicationError = EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('test');
      const errorEmailSendError: ApplicationError = EmailErrors.EMAIL_SEND_ERROR();

      expect(errorEmailTemplateLoadError.code).not.toBe(errorEmailSendError.code);
    });

    it('should have appropriate HTTP status codes', () => {
      expect(EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('test').status).toBe(500);
      expect(EmailErrors.EMAIL_SEND_ERROR().status).toBe(500);
    });

    it('should have descriptive error messages', () => {
      const errorEmailTemplateLoadError: ApplicationError = EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR('welcome');
      const errorEmailSendError: ApplicationError = EmailErrors.EMAIL_SEND_ERROR();

      expect(errorEmailTemplateLoadError.message.length).toBeGreaterThan(10);
      expect(errorEmailSendError.message.length).toBeGreaterThan(10);
      expect(errorEmailTemplateLoadError.message).not.toBe(errorEmailSendError.message);
    });
  });
});
