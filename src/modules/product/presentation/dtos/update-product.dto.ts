import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '../../../base/presentation/dtos/dtos/base.dto';

export class UpdateProductDto extends BaseDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
    minLength: 2,
    maxLength: 100
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  @AutoMap()
  public name: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 999.99,
    minimum: 0,
    maximum: 100000
  })
  @IsNotEmpty({ message: 'Product price is required' })
  @IsNumber({}, { message: 'Product price must be a number' })
  @AutoMap()
  public price: number;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features',
    required: false,
    minLength: 3,
    maxLength: 3000
  })
  @IsString({ message: 'Product description must be a string' })
  @IsOptional()
  @AutoMap()
  public description: string;
}
