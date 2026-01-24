import { QueryRunner } from 'typeorm';

export interface LoggerInterface {
  log(message: string, logMetadataOptions?: unknown): void;
  error(message: string, trace: string): void;
  warn(message: string): void;
  alert(message: string): void;
  silly(message: string): void;
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void;
  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void;
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void;
}
