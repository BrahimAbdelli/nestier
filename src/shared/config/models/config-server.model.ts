import { IsDefined, IsNumber, IsString } from 'class-validator';

export class ConfigServerModel {
  @IsDefined()
  @IsNumber()
  port: number;

  @IsDefined()
  @IsString()
  hostname: string;
}
