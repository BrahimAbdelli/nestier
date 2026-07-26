import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from './application-error.interface';

export class BaseErrors {
  public static INTERNAL_SERVER_ERROR(service: string, details: string): ApplicationError {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Internal server error in ${service}: ${details}`,
      metadata: JSON.stringify({ service, details }),
    };
  }

  public static EXTERNAL_SERVICE_ERROR(service: string, error: string): ApplicationError {
    return {
      code: 'EXTERNAL_SERVICE_ERROR',
      status: HttpStatus.BAD_GATEWAY,
      message: `External service '${service}' error: ${error}`,
      metadata: JSON.stringify({ service, error }),
    };
  }

  public static OPERATION_NOT_ALLOWED(
    operation: string,
    reason: string,
    context?: Record<string, unknown>
  ): ApplicationError {
    return {
      code: 'OPERATION_NOT_ALLOWED',
      status: HttpStatus.FORBIDDEN,
      message: `Operation '${operation}' is not allowed: ${reason}`,
      metadata: JSON.stringify({ operation, reason, ...context }),
    };
  }

  public static FIELD_NOT_UNIQUE(fieldKey: string, fieldValue: string): ApplicationError {
    return {
      code: 'FIELD_NOT_UNIQUE',
      status: HttpStatus.BAD_REQUEST,
      message: `${fieldKey} must be unique. The value '${fieldValue}' is already in use.`,
      metadata: fieldValue,
    };
  }
}
