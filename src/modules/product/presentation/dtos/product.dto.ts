import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class ProductDto extends BaseDto {
  @ApiProperty()
  @AutoMap()
  public name: string;

  @ApiProperty()
  @AutoMap()
  public price: number;

  @ApiProperty()
  @AutoMap()
  public description: string;
}
