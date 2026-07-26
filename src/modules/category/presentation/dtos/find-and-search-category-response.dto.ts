import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class FindAndSearchCategoryResponseDto extends BaseDto {
  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public id?: string;

  @ApiProperty({ description: 'Category name', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public name?: string;

  @ApiProperty({ description: 'Filter high volume categories', required: false })
  @IsOptional()
  @IsBoolean()
  @AutoMap()
  public highVolume?: boolean;

  @ApiProperty({ description: 'Filter empty categories', required: false })
  @IsOptional()
  @IsBoolean()
  @AutoMap()
  public empty?: boolean;

  @ApiProperty({ description: 'Search term for name', required: false })
  @IsOptional()
  @IsString()
  @AutoMap()
  public searchTerm?: string;

  @ApiProperty({ description: 'Minimum quantity', required: false })
  @IsOptional()
  @IsNumber()
  @AutoMap()
  public minQuantity?: number;

  @ApiProperty({ description: 'Maximum quantity', required: false })
  @IsOptional()
  @IsNumber()
  @AutoMap()
  public maxQuantity?: number;

  @ApiProperty({ description: 'Number of records to skip', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @AutoMap()
  public skip?: number;

  @ApiProperty({ description: 'Number of records to take', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @AutoMap()
  public take?: number;
}
