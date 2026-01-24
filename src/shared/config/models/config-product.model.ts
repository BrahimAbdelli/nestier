import { IsDefined, IsArray, IsString } from 'class-validator';

export class ConfigProductModel {
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  restrictedWords: string[];
}
