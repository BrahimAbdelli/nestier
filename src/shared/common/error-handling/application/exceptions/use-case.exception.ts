import { ApplicationException } from '../../domain/exceptions/application.exception';
import { ApplicationError } from '../../domain/errors/application-error.interface';
import { HttpStatus } from '@nestjs/common';

/**
 * Exception thrown when a use case fails
 */
export class UseCaseException extends ApplicationException {
  constructor(useCaseName: string, message: string, context?: Record<string, any>) {
    const error: ApplicationError = {
      code: 'USE_CASE_ERROR',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Use case '${useCaseName}' failed: ${message}`,
      metadata: JSON.stringify({ useCaseName, ...context }),
    };
    super(error);
  }
}
