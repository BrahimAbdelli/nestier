import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationException } from '../../domain/exceptions/application.exception';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response<any, Record<string, any>> = ctx.getResponse<Response>();
    const request: any = ctx.getRequest();

    const status: HttpStatus = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = {
      message: exception.message,
      code: exception.code,
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(exception.metadata && { metadata: exception.metadata })
    };

    response.status(status).json(errorResponse);
  }
}
