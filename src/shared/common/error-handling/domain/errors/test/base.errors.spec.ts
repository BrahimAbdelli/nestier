import { HttpStatus } from '@nestjs/common';
import { BaseErrors } from '../base.errors';
import { ApplicationError } from '../application-error.interface';

describe('BaseErrors', () => {
  describe('INTERNAL_SERVER_ERROR', () => {
    it('500 INTERNAL_SERVER_ERROR - should create error with correct structure', () => {
      const errorInternalServer: ApplicationError = BaseErrors.INTERNAL_SERVER_ERROR(
        'UserService',
        'Database connection failed'
      );

      expect(errorInternalServer.code).toBe('INTERNAL_SERVER_ERROR');
      expect(errorInternalServer.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(errorInternalServer.message).toBe('Internal server error in UserService: Database connection failed');
    });

    it('should include service and details in metadata', () => {
      const errorInternalServer: ApplicationError = BaseErrors.INTERNAL_SERVER_ERROR('ProductService', 'Timeout error');
      const metadata = JSON.parse(errorInternalServer.metadata as string);

      expect(metadata.service).toBe('ProductService');
      expect(metadata.details).toBe('Timeout error');
    });

    it('should handle special characters in service name and details', () => {
      const errorInternalServer: ApplicationError = BaseErrors.INTERNAL_SERVER_ERROR(
        'Service-123',
        'Error: Connection "failed"'
      );

      expect(errorInternalServer.message).toContain('Service-123');
      expect(errorInternalServer.message).toContain('Error: Connection "failed"');
    });
  });

  describe('EXTERNAL_SERVICE_ERROR', () => {
    it('502 EXTERNAL_SERVICE_ERROR - should create error with correct structure', () => {
      const errorExternalService: ApplicationError = BaseErrors.EXTERNAL_SERVICE_ERROR(
        'PaymentAPI',
        'Connection timeout'
      );

      expect(errorExternalService.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(errorExternalService.status).toBe(HttpStatus.BAD_GATEWAY);
      expect(errorExternalService.message).toBe("External service 'PaymentAPI' error: Connection timeout");
    });

    it('should include service and error in metadata', () => {
      const errorExternalService: ApplicationError = BaseErrors.EXTERNAL_SERVICE_ERROR('EmailService', 'SMTP error');
      const metadata = JSON.parse(errorExternalService.metadata as string);

      expect(metadata.service).toBe('EmailService');
      expect(metadata.error).toBe('SMTP error');
    });

    it('should handle empty error message', () => {
      const errorExternalService: ApplicationError = BaseErrors.EXTERNAL_SERVICE_ERROR('TestService', '');

      expect(errorExternalService.message).toBe("External service 'TestService' error: ");
    });
  });

  describe('OPERATION_NOT_ALLOWED', () => {
    it('403 OPERATION_NOT_ALLOWED - should create error with correct structure', () => {
      const errorOperationNotAllowed: ApplicationError = BaseErrors.OPERATION_NOT_ALLOWED(
        'DELETE',
        'User is not admin'
      );

      expect(errorOperationNotAllowed.code).toBe('OPERATION_NOT_ALLOWED');
      expect(errorOperationNotAllowed.status).toBe(HttpStatus.FORBIDDEN);
      expect(errorOperationNotAllowed.message).toBe("Operation 'DELETE' is not allowed: User is not admin");
    });

    it('should include operation and reason in metadata', () => {
      const errorOperationNotAllowed: ApplicationError = BaseErrors.OPERATION_NOT_ALLOWED(
        'UPDATE',
        'Resource is locked'
      );
      const metadata = JSON.parse(errorOperationNotAllowed.metadata as string);

      expect(metadata.operation).toBe('UPDATE');
      expect(metadata.reason).toBe('Resource is locked');
    });

    it('should include additional context when provided', () => {
      const context: Record<string, unknown> = { userId: '123', role: 'user' };
      const errorOperationNotAllowed: ApplicationError = BaseErrors.OPERATION_NOT_ALLOWED(
        'CREATE',
        'Insufficient permissions',
        context
      );
      const metadata = JSON.parse(errorOperationNotAllowed.metadata as string);

      expect(metadata.operation).toBe('CREATE');
      expect(metadata.reason).toBe('Insufficient permissions');
      expect(metadata.userId).toBe('123');
      expect(metadata.role).toBe('user');
    });

    it('should work without context parameter', () => {
      const errorOperationNotAllowed: ApplicationError = BaseErrors.OPERATION_NOT_ALLOWED(
        'ARCHIVE',
        'Already archived'
      );
      const metadata = JSON.parse(errorOperationNotAllowed.metadata as string);

      expect(metadata.operation).toBe('ARCHIVE');
      expect(metadata.reason).toBe('Already archived');
      expect(Object.keys(metadata).length).toBe(2);
    });

    it('should handle complex context objects', () => {
      const context: Record<string, unknown> = {
        user: { id: '123', name: 'John' },
        resource: { type: 'document', id: '456' },
      };
      const errorOperationNotAllowed: ApplicationError = BaseErrors.OPERATION_NOT_ALLOWED(
        'SHARE',
        'Private resource',
        context
      );
      const metadata = JSON.parse(errorOperationNotAllowed.metadata as string);

      expect(metadata.user).toEqual({ id: '123', name: 'John' });
      expect(metadata.resource).toEqual({ type: 'document', id: '456' });
    });
  });

  describe('FIELD_NOT_UNIQUE', () => {
    it('400 FIELD_NOT_UNIQUE - should create error with correct structure', () => {
      const errorFieldNotUnique: ApplicationError = BaseErrors.FIELD_NOT_UNIQUE('email', 'test@example.com');

      expect(errorFieldNotUnique.code).toBe('FIELD_NOT_UNIQUE');
      expect(errorFieldNotUnique.status).toBe(HttpStatus.BAD_REQUEST);
      expect(errorFieldNotUnique.message).toBe("email must be unique. The value 'test@example.com' is already in use.");
    });

    it('should store field value in metadata', () => {
      const errorFieldNotUnique: ApplicationError = BaseErrors.FIELD_NOT_UNIQUE('username', 'john_doe');

      expect(errorFieldNotUnique.metadata).toBe('john_doe');
    });

    it('should handle different field names', () => {
      const fieldTestCases: Array<[string, string]> = [
        ['username', 'admin'],
        ['email', 'user@test.com'],
        ['phone', '+1234567890'],
        ['slug', 'my-article'],
      ];

      for (const [fieldKey, fieldValue] of fieldTestCases) {
        const errorFieldNotUnique: ApplicationError = BaseErrors.FIELD_NOT_UNIQUE(fieldKey, fieldValue);

        expect(errorFieldNotUnique.message).toContain(fieldKey);
        expect(errorFieldNotUnique.message).toContain(fieldValue);
        expect(errorFieldNotUnique.metadata).toBe(fieldValue);
      }
    });

    it('should handle special characters in field value', () => {
      const errorFieldNotUnique: ApplicationError = BaseErrors.FIELD_NOT_UNIQUE('email', "user's@test.com");

      expect(errorFieldNotUnique.message).toContain("user's@test.com");
      expect(errorFieldNotUnique.metadata).toBe("user's@test.com");
    });
  });

  describe('Error consistency', () => {
    it('should always return ApplicationError interface', () => {
      const allErrors: ApplicationError[] = [
        BaseErrors.INTERNAL_SERVER_ERROR('Service', 'Error'),
        BaseErrors.EXTERNAL_SERVICE_ERROR('API', 'Error'),
        BaseErrors.OPERATION_NOT_ALLOWED('OP', 'Reason'),
        BaseErrors.FIELD_NOT_UNIQUE('field', 'value'),
      ];

      for (const currentError of allErrors) {
        expect(currentError).toHaveProperty('code');
        expect(currentError).toHaveProperty('status');
        expect(currentError).toHaveProperty('message');
        expect(currentError).toHaveProperty('metadata');
      }
    });

    it('should have unique error codes', () => {
      const errorCodes: string[] = [
        BaseErrors.INTERNAL_SERVER_ERROR('S', 'E').code,
        BaseErrors.EXTERNAL_SERVICE_ERROR('S', 'E').code,
        BaseErrors.OPERATION_NOT_ALLOWED('O', 'R').code,
        BaseErrors.FIELD_NOT_UNIQUE('F', 'V').code,
      ];

      const uniqueErrorCodes: Set<string> = new Set(errorCodes);
      expect(uniqueErrorCodes.size).toBe(errorCodes.length);
    });

    it('should have appropriate HTTP status codes', () => {
      expect(BaseErrors.INTERNAL_SERVER_ERROR('S', 'E').status).toBe(500);
      expect(BaseErrors.EXTERNAL_SERVICE_ERROR('S', 'E').status).toBe(502);
      expect(BaseErrors.OPERATION_NOT_ALLOWED('O', 'R').status).toBe(403);
      expect(BaseErrors.FIELD_NOT_UNIQUE('F', 'V').status).toBe(400);
    });
  });
});
