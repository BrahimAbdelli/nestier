import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { ApplicationException } from '../../domain/exceptions/application.exception';

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  public catch(exception: ApplicationException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    const status: HttpStatus = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: Record<string, unknown> = {
      message: exception.message,
      code: exception.code,
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(exception.metadata && { metadata: exception.metadata }),
    };

    response.status(status).json(errorResponse);
  }
}
