import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ComparatorEnum } from '../enums/comparator.enum';

export class AttributeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @AutoMap()
  key: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ComparatorEnum)
  @AutoMap()
  comparator: ComparatorEnum;

  @ApiProperty()
  @IsOptional()
  @AutoMap()
  value: any;
}
