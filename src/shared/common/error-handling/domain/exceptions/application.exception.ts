import { ApplicationError } from '../errors/application-error.interface';

export class ApplicationException extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly metadata?: string;

  constructor(error: ApplicationError) {
    super(error.message);
    this.name = 'ApplicationException';
    this.code = error.code;
    this.status = error.status;
    this.metadata = error.metadata;
  }
}
