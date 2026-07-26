import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateNewPasswordDto {
  @ApiProperty({ description: 'Reset password token' })
  @IsNotEmpty()
  @IsString()
  @AutoMap()
  public token: string;

  @ApiProperty({ description: 'New password for the user account' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  @AutoMap()
  public password: string;
}
