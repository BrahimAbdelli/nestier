import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { EntityFieldsNames } from '../../types/entity-fields-names.type';
import { AttributeDto } from './attribute.dto';
import { ComparaisonTypeEnum } from '../enums/comparaison.enum';
import { OrderEnum } from '../enums/order.enum';

export class QueryDto<T> {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  @ArrayMinSize(1)
  @IsNotEmpty()
  @AutoMap()
  attributes: AttributeDto[];

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @AutoMap()
  take: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @AutoMap()
  skip: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ComparaisonTypeEnum)
  @AutoMap()
  type: ComparaisonTypeEnum;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @AutoMap()
  orders: {
    [P in EntityFieldsNames<T>]?: OrderEnum.ASC | OrderEnum.DESC | 1 | -1;
  };

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @AutoMap()
  isPaginable: boolean;

  @IsEnum(OrderEnum, { each: true })
  get enumValidation(): OrderEnum[] {
    if (this.orders) {
      const values = Object.values(this.orders) as OrderEnum[];
      if (values.length > 0) {
        return values;
      }
    }
    return null;
  }
}
