import { InfrastructureException } from './infrastructure.exception';

/**
 * Exception thrown when database operations fail
 */
export class DatabaseException extends InfrastructureException {
  constructor(operation: string, message: string, context?: Record<string, any>) {
    super(`Database operation '${operation}' failed: ${message}`, 'DATABASE_ERROR', { operation, ...context });
  }
}
