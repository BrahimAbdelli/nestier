import { HttpStatus } from '@nestjs/common';

export interface ApplicationError {
  code: string;
  status: HttpStatus;
  message: string;
  metadata?: string;
}
