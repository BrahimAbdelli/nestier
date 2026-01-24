import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationException } from '../../../domain/exceptions/application.exception';
import { EntityNotFoundDomainException } from '../../../domain/exceptions/entity-not-found.exception';
import { BusinessRuleViolationException } from '../../../domain/exceptions/business-rule-violation.exception';
import { DomainValidationException } from '../../../domain/exceptions/validation.exception';
import { DatabaseException } from '../../exceptions/database.exception';
import { ErrorMapperService } from '../error-mapper.service';

describe('ErrorMapperService', () => {
  let service: ErrorMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorMapperService],
    }).compile();

    service = module.get<ErrorMapperService>(ErrorMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapToHttpException', () => {
    describe('DomainException mapping', () => {
      it('404 NOT_FOUND - should be mapped for entity not found', () => {
        const errorEntityNotFound: EntityNotFoundDomainException = new EntityNotFoundDomainException();
        const httpException: HttpException = service.mapToHttpException(errorEntityNotFound);

        expect(httpException.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(httpException.getResponse()).toMatchObject({
          message: 'Resource not found',
          code: 'NOT_FOUND',
        });
      });

      it('404 NOT_FOUND - should be mapped with timestamp', () => {
        const errorEntityNotFound: EntityNotFoundDomainException = new EntityNotFoundDomainException();
        const httpException: HttpException = service.mapToHttpException(errorEntityNotFound);

        expect(httpException.getStatus()).toBe(HttpStatus.NOT_FOUND);
      });

      it('422 BUSINESS_RULE_VIOLATION - should be mapped for business rule violation', () => {
        const errorBusinessRule: BusinessRuleViolationException = new BusinessRuleViolationException('MaxPrice', 'Price exceeds maximum allowed');
        const httpException: HttpException = service.mapToHttpException(errorBusinessRule);

        expect(httpException.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('400 DOMAIN_VALIDATION_ERROR - should be mapped for validation errors', () => {
        const errorDomainValidation: DomainValidationException = new DomainValidationException('Validation failed', { field: ['error'] });
        const httpException: HttpException = service.mapToHttpException(errorDomainValidation);

        expect(httpException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      });

      it('422 UNPROCESSABLE_ENTITY - should be mapped for unknown domain errors', () => {
        const errorUnknownDomain: BusinessRuleViolationException = new BusinessRuleViolationException('UnknownRule', 'Unknown error');
        const httpException: HttpException = service.mapToHttpException(errorUnknownDomain);

        expect(httpException.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('should include context in domain exception response', () => {
        const errorWithContext: BusinessRuleViolationException = new BusinessRuleViolationException('TestRule', 'Test error', { userId: '123' });
        const httpException: HttpException = service.mapToHttpException(errorWithContext);

        expect(httpException.getResponse()).toMatchObject({
          context: expect.objectContaining({ userId: '123' }),
        });
      });
    });

    describe('ApplicationException mapping', () => {
      it('422 USE_CASE_ERROR - should be mapped for use case errors', () => {
        const errorUseCase: ApplicationException = new ApplicationException({
          code: 'USE_CASE_ERROR',
          message: 'Use case failed',
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        });
        const httpException: HttpException = service.mapToHttpException(errorUseCase);

        expect(httpException.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('403 OPERATION_NOT_ALLOWED - should be mapped for forbidden operations', () => {
        const errorOperationNotAllowed: ApplicationException = new ApplicationException({
          code: 'OPERATION_NOT_ALLOWED',
          message: 'Operation not allowed',
          status: HttpStatus.FORBIDDEN,
        });
        const httpException: HttpException = service.mapToHttpException(errorOperationNotAllowed);

        expect(httpException.getStatus()).toBe(HttpStatus.FORBIDDEN);
      });

      it('400 BAD_REQUEST - should be mapped for product validation errors', () => {
        const productErrorCodes: string[] = [
          'PRODUCT_NAME_REQUIRED',
          'PRODUCT_NAME_TOO_LONG',
          'PRODUCT_PRICE_NEGATIVE',
          'PRODUCT_DESCRIPTION_REQUIRED',
          'PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL',
          'PRODUCT_NAME_CONTAINS_RESTRICTED_WORD',
          'PRODUCT_PRICE_TOO_LOW',
        ];

        for (const errorCode of productErrorCodes) {
          const errorProductValidation: ApplicationException = new ApplicationException({
            code: errorCode,
            message: 'Product validation error',
            status: HttpStatus.BAD_REQUEST,
          });
          const httpException: HttpException = service.mapToHttpException(errorProductValidation);

          expect(httpException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });

      it('400 BAD_REQUEST - should be mapped for category validation errors', () => {
        const categoryErrorCodes: string[] = [
          'CATEGORY_NAME_REQUIRED',
          'CATEGORY_NAME_TOO_LONG',
          'CATEGORY_QUANTITY_NEGATIVE',
          'CATEGORY_DESCRIPTION_TOO_LONG',
          'CATEGORY_ALREADY_EXISTS',
        ];

        for (const errorCode of categoryErrorCodes) {
          const errorCategoryValidation: ApplicationException = new ApplicationException({
            code: errorCode,
            message: 'Category validation error',
            status: HttpStatus.BAD_REQUEST,
          });
          const httpException: HttpException = service.mapToHttpException(errorCategoryValidation);

          expect(httpException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });

      it('400 BAD_REQUEST - should be mapped for user validation errors', () => {
        const userErrorCodes: string[] = [
          'USER_USERNAME_REQUIRED',
          'USER_USERNAME_INVALID_LENGTH',
          'USER_USERNAME_INVALID_CHARACTERS',
          'USER_EMAIL_REQUIRED',
          'USER_EMAIL_INVALID_FORMAT',
          'USER_PASSWORD_REQUIRED',
          'USER_PASSWORD_TOO_SHORT',
          'USER_LASTNAME_REQUIRED',
          'USER_ALREADY_EXISTS',
          'FIELD_NOT_UNIQUE',
        ];

        for (const errorCode of userErrorCodes) {
          const errorUserValidation: ApplicationException = new ApplicationException({
            code: errorCode,
            message: 'User validation error',
            status: HttpStatus.BAD_REQUEST,
          });
          const httpException: HttpException = service.mapToHttpException(errorUserValidation);

          expect(httpException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });

      it('404 USER_NOT_FOUND - should be mapped to not found', () => {
        const errorUserNotFound: ApplicationException = new ApplicationException({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
        });
        const httpException: HttpException = service.mapToHttpException(errorUserNotFound);

        expect(httpException.getStatus()).toBe(HttpStatus.NOT_FOUND);
      });

      it('401 UNAUTHORIZED - should be mapped for authentication errors', () => {
        const authErrorCodes: string[] = [
          'USER_AUTHENTICATION_FAILED',
          'USER_INVALID_RESET_TOKEN',
          'USER_RESET_TOKEN_EXPIRED',
        ];

        for (const errorCode of authErrorCodes) {
          const errorAuthentication: ApplicationException = new ApplicationException({
            code: errorCode,
            message: 'Authentication error',
            status: HttpStatus.UNAUTHORIZED,
          });
          const httpException: HttpException = service.mapToHttpException(errorAuthentication);

          expect(httpException.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        }
      });

      it('should use provided status when available', () => {
        const errorCustomStatus: ApplicationException = new ApplicationException({
          code: 'CUSTOM_ERROR',
          message: 'Custom error',
          status: HttpStatus.CONFLICT,
        });
        const httpException: HttpException = service.mapToHttpException(errorCustomStatus);

        expect(httpException.getStatus()).toBe(HttpStatus.CONFLICT);
      });

      it('should include metadata in application exception response', () => {
        const errorWithMetadata: ApplicationException = new ApplicationException({
          code: 'TEST_ERROR',
          message: 'Error with metadata',
          status: HttpStatus.BAD_REQUEST,
          metadata: JSON.stringify({ field: 'test' }),
        });
        const httpException: HttpException = service.mapToHttpException(errorWithMetadata);

        expect(httpException.getResponse()).toMatchObject({
          metadata: JSON.stringify({ field: 'test' }),
        });
      });

      it('422 UNPROCESSABLE_ENTITY - should be mapped for unknown application errors', () => {
        const errorUnknownApplication: ApplicationException = new ApplicationException({
          code: 'UNKNOWN_APP_ERROR',
          message: 'Unknown error',
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        });
        const httpException: HttpException = service.mapToHttpException(errorUnknownApplication);

        expect(httpException.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    describe('InfrastructureException mapping', () => {
      it('500 DATABASE_ERROR - should be mapped to internal server error', () => {
        const errorDatabase: DatabaseException = new DatabaseException('save', 'Connection timeout');
        const httpException: HttpException = service.mapToHttpException(errorDatabase);

        expect(httpException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it('500 INTERNAL_SERVER_ERROR - should be mapped for external service errors', () => {
        const errorExternalService: DatabaseException = new DatabaseException('query', 'External service error', { code: 'EXTERNAL_SERVICE_ERROR' });
        const httpException: HttpException = service.mapToHttpException(errorExternalService);

        expect(httpException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it('500 INTERNAL_SERVER_ERROR - should be mapped for unknown infrastructure errors', () => {
        const errorUnknownInfrastructure: DatabaseException = new DatabaseException('delete', 'Unknown error');
        const httpException: HttpException = service.mapToHttpException(errorUnknownInfrastructure);

        expect(httpException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it('should include context in infrastructure exception response', () => {
        const errorInfrastructureWithContext: DatabaseException = new DatabaseException('update', 'Error with context', { service: 'database' });
        const httpException: HttpException = service.mapToHttpException(errorInfrastructureWithContext);

        expect(httpException.getResponse()).toMatchObject({
          context: expect.objectContaining({ service: 'database' }),
        });
      });
    });

    describe('Unknown error handling', () => {
      it('500 INTERNAL_SERVER_ERROR - should be mapped for unknown errors', () => {
        const errorUnknown: Error = new Error('Unknown error');
        const httpException: HttpException = service.mapToHttpException(errorUnknown);

        expect(httpException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(httpException.getResponse()).toMatchObject({
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        });
      });

      it('should include timestamp in unknown error response', () => {
        const errorUnknown: Error = new Error('Unknown error');
        const httpException: HttpException = service.mapToHttpException(errorUnknown);
        const response: any = httpException.getResponse();

        expect(response.timestamp).toBeDefined();
        expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0);
      });
    });

    describe('Response structure', () => {
      it('should always include timestamp in response', () => {
        const errorEntityNotFound: EntityNotFoundDomainException = new EntityNotFoundDomainException();
        const httpException: HttpException = service.mapToHttpException(errorEntityNotFound);
        const response: any = httpException.getResponse();

        expect(response.timestamp).toBeDefined();
        expect(typeof response.timestamp).toBe('string');
      });

      it('should include all required fields in response', () => {
        const errorApplication: ApplicationException = new ApplicationException({
          code: 'TEST_ERROR',
          message: 'Test message',
          status: HttpStatus.BAD_REQUEST,
        });
        const httpException: HttpException = service.mapToHttpException(errorApplication);
        const response: any = httpException.getResponse();

        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('code');
        expect(response).toHaveProperty('timestamp');
      });
    });
  });
});
