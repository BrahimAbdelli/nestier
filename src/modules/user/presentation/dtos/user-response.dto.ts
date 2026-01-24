import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { transformEntity } from '@shared/common/utils/transform-entity.utlis';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  @Transform(transformEntity)
  @AutoMap()
  public _id: ObjectId;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @AutoMap()
  public username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @AutoMap()
  public email: string;

  @ApiProperty({ description: 'User roles', example: ['user', 'admin'] })
  @AutoMap()
  public roles: string[];

  @ApiProperty({ description: 'Reset password token', required: false })
  @AutoMap()
  public resetPasswordToken?: string;
}

