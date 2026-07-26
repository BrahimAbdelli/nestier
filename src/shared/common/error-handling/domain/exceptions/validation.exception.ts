import { DomainException } from './domain.exception';

/**
 * Exception thrown when domain validation fails
 */
export class DomainValidationException extends DomainException {
  public readonly validationErrors: Record<string, string[]>;

  constructor(message: string, validationErrors: Record<string, string[]>, context?: Record<string, any>) {
    super(`Domain validation failed: ${message}`, 'DOMAIN_VALIDATION_ERROR', { validationErrors, ...context });
    this.validationErrors = validationErrors;
  }
}
