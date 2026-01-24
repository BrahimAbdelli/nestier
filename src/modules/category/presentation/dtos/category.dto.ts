import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class CategoryDto extends BaseDto {
  @ApiProperty({ description: 'Category name' })
  @AutoMap()
  public name: string;

  @ApiProperty({ description: 'Number of products in this category' })
  @AutoMap()
  public quantity: number;

  @ApiProperty({ description: 'Category description', required: false })
  @AutoMap()
  public description?: string;
}
