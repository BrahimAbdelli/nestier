import { DomainException } from "./domain.exception";

/**
 * Exception thrown when a business rule is violated
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(
    ruleName: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(
      `Business rule violation: ${ruleName} - ${message}`,
      'BUSINESS_RULE_VIOLATION',
      { ruleName, ...context }
    );
  }
}



