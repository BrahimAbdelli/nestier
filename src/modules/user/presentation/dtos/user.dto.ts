import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class UserDto extends BaseDto {
  @ApiProperty({ description: 'Username of the user' })
  @AutoMap()
  public username: string;

  @ApiProperty({ description: 'Email address of the user' })
  @AutoMap()
  public email: string;

  @ApiProperty({ description: 'Last name of the user' })
  @AutoMap()
  public lastname: string;

  @ApiProperty({ description: 'Address of the user' })
  @AutoMap()
  public address: string;

  @ApiProperty({ description: 'Phone number of the user' })
  @AutoMap()
  public phone: string;

  @ApiProperty({ description: 'Roles assigned to the user', type: [String] })
  @AutoMap()
  public roles: string[];

  @ApiProperty({ description: 'Profile image URL of the user' })
  @AutoMap()
  public image: string;

  @ApiProperty({ description: 'Whether the user is active' })
  @AutoMap()
  public status: boolean;

  @ApiProperty({ description: 'About information of the user' })
  @AutoMap()
  public about: string;

  @ApiProperty({ description: 'Last update timestamp' })
  @AutoMap()
  public lastUpdateAt: Date;
}

