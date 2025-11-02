import { IsDefined, IsString } from 'class-validator';

export class ConfigAuthModel {
  @IsDefined()
  @IsString()
  secret: string;

  @IsDefined()
  @IsString()
  resetPasswordExpiration: string;

  @IsDefined()
  @IsString()
  resetPasswordUrl: string;

  @IsDefined()
  @IsString()
  tokenExpiration: string;

  @IsDefined()
  @IsString()
  supportEmail: string;
}

