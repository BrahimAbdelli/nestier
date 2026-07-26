import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMapper } from './error-mapper.interface';
import { DomainException } from '../../domain/exceptions';
import { ApplicationException } from '../../domain/exceptions/application.exception';
import { InfrastructureException } from '../exceptions/infrastructure.exception';

@Injectable()
export class ErrorMapperService implements ErrorMapper {
  mapToHttpException(error: Error): HttpException {
    // Domain exceptions
    if (error instanceof DomainException) {
      return this.mapDomainException(error);
    }

    // Application exceptions
    if (error instanceof ApplicationException) {
      return this.mapApplicationException(error);
    }

    // Infrastructure exceptions
    if (error instanceof InfrastructureException) {
      return this.mapInfrastructureException(error);
    }

    // Default to internal server error for unknown exceptions
    return new HttpException(
      {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private mapDomainException(error: DomainException): HttpException {
    const status: HttpStatus = this.getHttpStatusForDomainException(error);

    return new HttpException(
      {
        message: error.message,
        code: error.code,
        context: error.context,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  private mapApplicationException(error: ApplicationException): HttpException {
    const status: HttpStatus = error.status || this.getHttpStatusForApplicationException(error);

    return new HttpException(
      {
        message: error.message,
        code: error.code,
        metadata: error.metadata,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  private mapInfrastructureException(error: InfrastructureException): HttpException {
    const status: HttpStatus = this.getHttpStatusForInfrastructureException(error);

    return new HttpException(
      {
        message: error.message,
        code: error.code,
        context: error.context,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }

  private getHttpStatusForDomainException(error: DomainException): HttpStatus {
    switch (error.code) {
      case 'ENTITY_NOT_FOUND':
      case 'NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'BUSINESS_RULE_VIOLATION':
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case 'DOMAIN_VALIDATION_ERROR':
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.UNPROCESSABLE_ENTITY;
    }
  }

  private getHttpStatusForApplicationException(error: ApplicationException): HttpStatus {
    switch (error.code) {
      case 'USE_CASE_ERROR':
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case 'OPERATION_NOT_ALLOWED':
        return HttpStatus.FORBIDDEN;
      case 'PRODUCT_NAME_REQUIRED':
      case 'PRODUCT_NAME_TOO_LONG':
      case 'PRODUCT_PRICE_NEGATIVE':
      case 'PRODUCT_DESCRIPTION_REQUIRED':
      case 'PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL':
      case 'PRODUCT_NAME_CONTAINS_RESTRICTED_WORD':
      case 'PRODUCT_PRICE_TOO_LOW':
      case 'CATEGORY_NAME_REQUIRED':
      case 'CATEGORY_NAME_TOO_LONG':
      case 'CATEGORY_QUANTITY_NEGATIVE':
      case 'CATEGORY_DESCRIPTION_TOO_LONG':
      case 'CATEGORY_ALREADY_EXISTS':
      case 'USER_USERNAME_REQUIRED':
      case 'USER_USERNAME_INVALID_LENGTH':
      case 'USER_USERNAME_INVALID_CHARACTERS':
      case 'USER_EMAIL_REQUIRED':
      case 'USER_EMAIL_INVALID_FORMAT':
      case 'USER_PASSWORD_REQUIRED':
      case 'USER_PASSWORD_TOO_SHORT':
      case 'USER_LASTNAME_REQUIRED':
      case 'USER_ALREADY_EXISTS':
      case 'FIELD_NOT_UNIQUE':
        return HttpStatus.BAD_REQUEST;
      case 'USER_NOT_FOUND':
        return HttpStatus.NOT_FOUND;
      case 'USER_AUTHENTICATION_FAILED':
      case 'USER_INVALID_RESET_TOKEN':
      case 'USER_RESET_TOKEN_EXPIRED':
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.UNPROCESSABLE_ENTITY;
    }
  }

  private getHttpStatusForInfrastructureException(error: InfrastructureException): HttpStatus {
    switch (error.code) {
      case 'DATABASE_ERROR':
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'EXTERNAL_SERVICE_ERROR':
        return HttpStatus.BAD_GATEWAY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
