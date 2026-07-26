import { ApplicationException } from '../../domain/exceptions/application.exception';
import { ApplicationError } from '../../domain/errors/application-error.interface';
import { HttpStatus } from '@nestjs/common';

/**
 * Exception thrown when an operation is not allowed
 */
export class OperationNotAllowedException extends ApplicationException {
  constructor(operation: string, reason: string, context?: Record<string, any>) {
    const error: ApplicationError = {
      code: 'OPERATION_NOT_ALLOWED',
      status: HttpStatus.FORBIDDEN,
      message: `Operation '${operation}' is not allowed: ${reason}`,
      metadata: JSON.stringify({ operation, reason, ...context }),
    };
    super(error);
  }
}
