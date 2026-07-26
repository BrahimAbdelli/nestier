import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TypeORM from 'typeorm';
import * as winston from 'winston';
import type * as Transport from 'winston-transport';
import { TypeLogSql } from '../../config/models/config-database.model';
import { messageFormatter, errorMetadata } from './logger-formatters';
import { LoggerInterface } from './logger.interface';

@Injectable()
export class Logger implements LoggerService, LoggerInterface, TypeORM.Logger {
  private readonly logger: winston.Logger;
  private readonly enabledQueryLogTypes: TypeLogSql[] = [TypeLogSql.ERROR, TypeLogSql.SLOW];
  private readonly SQL_PARAMS_PREFIX: string = ' -- parameters: ';

  constructor(private readonly configService: ConfigService) {
    this.logger = this.initializeWinstonLogger();
  }

  public debug(message: any, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }

  public error(message: any, ...optionalParams: any[]): void {
    const normalizedParams: any[] = this.normalizeErrorParameters(optionalParams);
    this.logger.error(message, ...normalizedParams);
  }

  public log(message: any, ...optionalParams: any[]): void {
    this.logger.info(message, ...optionalParams);
  }

  public verbose(message: any, ...optionalParams: any[]): void {
    this.logger.verbose(message, ...optionalParams);
  }

  public warn(message: any, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }

  public silly(message: string, ...optionalParams: any[]): void {
    this.logger.silly(message, ...optionalParams);
  }

  public alert(message: string, ...optionalParams: any[]): void {
    this.logger.alert(message, ...optionalParams);
  }

  public logQuery(query: string, parameters?: unknown[]): void {
    if (!this.isQueryLogTypeEnabled(TypeLogSql.QUERY)) {
      return;
    }

    const formattedSql: string = this.formatQueryWithParameters(query, parameters);
    this.logger.debug(`Request : ${formattedSql}`);
  }

  public logQueryError(error: string, query: string, parameters?: unknown[]): void {
    if (!this.isQueryLogTypeEnabled(TypeLogSql.ERROR)) {
      return;
    }

    const formattedSql: string = this.formatQueryWithParameters(query, parameters);
    this.logger.error(`This request failed: ${formattedSql}${error}`);
  }

  public logQuerySlow(executionTime: number, query: string, parameters?: unknown[]): void {
    if (!this.isQueryLogTypeEnabled(TypeLogSql.SLOW)) {
      return;
    }

    const formattedSql: string = this.formatQueryWithParameters(query, parameters);
    this.logger.warn(`This request : ${formattedSql} was detected as slow, execution time : ${executionTime}`);
  }

  public logSchemaBuild(message: string): void {
    this.logger.debug(`[TypeORM] Build schema: ${message}`);
  }

  public logMigration(message: string): void {
    this.logger.info(`[TypeORM] Migration: ${message}`);
  }

  private initializeWinstonLogger(): winston.Logger {
    const { combine, metadata, timestamp, json } = winston.format;

    const consoleTransport: winston.transports.ConsoleTransportInstance = new winston.transports.Console({
      format: combine(
        metadata({ key: 'server_meta' }),
        errorMetadata(),
        timestamp({ alias: 'server_timestamp' }),
        messageFormatter(),
        json()
      ),
    });

    const transports: Transport[] = [consoleTransport];

    return winston.createLogger({ transports });
  }

  private normalizeErrorParameters(optionalParams: any[]): any[] {
    const hasParameters: boolean = Boolean(optionalParams?.length);
    const firstParamIsError: boolean = optionalParams[0] instanceof Error;

    if (hasParameters && firstParamIsError) {
      const errorObject: { error: Error } = { error: optionalParams[0] as Error };
      const remainingParams: any[] = optionalParams.slice(1);
      return [errorObject, ...remainingParams];
    }

    return optionalParams;
  }

  private isQueryLogTypeEnabled(logType: TypeLogSql): boolean {
    return this.enabledQueryLogTypes.includes(logType);
  }

  private formatQueryWithParameters(query: string, parameters?: unknown[]): string {
    const hasParameters: boolean = Boolean(parameters?.length);

    if (!hasParameters) {
      return query;
    }

    const stringifiedParameters: string = this.stringifyParameters(parameters);
    return `${query}${this.SQL_PARAMS_PREFIX}${stringifiedParameters}`;
  }

  private stringifyParameters(parameters: unknown[]): string {
    try {
      return JSON.stringify(parameters);
    } catch (error: unknown) {
      this.logger.error('Error stringify params', { error });
      return parameters.toString();
    }
  }
}
