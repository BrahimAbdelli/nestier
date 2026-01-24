import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class UpdateCategoryDto extends BaseDto{
  @ApiProperty({ description: 'Category name', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public name?: string;

  @ApiProperty({ description: 'Number of products in this category', required: false })
  @IsOptional()
  @IsNumber()
  @AutoMap()
  public quantity?: number;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public description?: string;
}
