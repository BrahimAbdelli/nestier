/**
 * Base infrastructure exception class
 * All infrastructure layer exceptions should extend this class
 */
export abstract class InfrastructureException extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}




