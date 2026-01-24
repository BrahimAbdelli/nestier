import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class CreateCategoryDto extends BaseDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @AutoMap()
  public name: string;

  @ApiProperty({ description: 'Number of products in this category', default: 0 })
  @IsNumber()
  @AutoMap()
  public quantity: number = 0;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public description?: string;
}
