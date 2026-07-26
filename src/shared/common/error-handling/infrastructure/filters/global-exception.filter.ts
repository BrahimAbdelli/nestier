import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorMapperService } from '../mappers/error-mapper.service';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly errorMapper: ErrorMapperService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response<any, Record<string, any>> = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    let httpException: HttpException;

    if (exception instanceof HttpException) {
      httpException = exception;
    } else if (exception instanceof Error) {
      httpException = this.errorMapper.mapToHttpException(exception);
    } else {
      httpException = new HttpException(
        {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const status: number = httpException.getStatus();
    const exceptionResponse: any = httpException.getResponse();

    this.logError(exception, request, status);

    const responseBody: any =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? { ...exceptionResponse, path: request.url, method: request.method }
        : {
            message: exceptionResponse,
            path: request.url,
            method: request.method,
          };

    response.status(status).json(responseBody);
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const { method, url, body, query, params } = request;

    const logContext = {
      method,
      url,
      body,
      query,
      params,
      status,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `Server error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
        logContext
      );
    } else if (status >= 400) {
      this.logger.warn(`Client error: ${exception instanceof Error ? exception.message : 'Unknown error'}`, logContext);
    }
  }
}
