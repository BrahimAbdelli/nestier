import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class UpdateUserDto extends BaseDto {
  @ApiProperty({ description: 'Username of the user', minLength: 3, maxLength: 30, required: false })
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @AutoMap()
  public username?: string;

  @ApiProperty({ description: 'Email address of the user', required: false })
  @IsOptional()
  @IsEmail()
  @AutoMap()
  public email?: string;

  @ApiProperty({ description: 'Password for the user account', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public password?: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public lastname?: string;

  @ApiProperty({ description: 'Address of the user', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public address?: string;

  @ApiProperty({ description: 'Phone number of the user', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public phone?: string;

  @ApiProperty({ description: 'Roles assigned to the user', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @AutoMap()
  public roles?: string[];

  @ApiProperty({ description: 'Profile image URL of the user', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public image?: string;

  @ApiProperty({ description: 'Whether the user is active', required: false })
  @IsOptional()
  @IsBoolean()
  @AutoMap()
  public status?: boolean;

  @ApiProperty({ description: 'About information of the user', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public about?: string;
}
