import { IsDefined, IsString } from 'class-validator';

export class ConfigMailjetModel {
  @IsDefined()
  @IsString()
  mail: string;

  @IsDefined()
  @IsString()
  apiKey: string;

  @IsDefined()
  @IsString()
  secretKey: string;

  @IsDefined()
  @IsString()
  version: any;

  @IsDefined()
  @IsString()
  companyName: string;
}
