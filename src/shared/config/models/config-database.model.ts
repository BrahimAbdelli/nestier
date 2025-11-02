import { IsArray, IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';
import 'reflect-metadata';

export enum TypeLogSql {
  QUERY = 'query',
  ERROR = 'error',
  SLOW = 'slow',
}

export class ConfigDatabaseModel {
  @IsDefined()
  @IsString()
  type: string;

  @IsDefined()
  @IsString()
  url: string;

  @IsDefined()
  @IsBoolean()
  synchronize: boolean;

  @IsDefined()
  @IsArray()
  entities: unknown[];

  @IsOptional()
  @IsBoolean()
  cache: boolean;
}
