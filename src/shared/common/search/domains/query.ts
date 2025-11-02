import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import {
  IsEnum,
  ValidateNested
} from 'class-validator';
import { EntityFieldsNames } from '../../types/entity-fields-names.type';
import { ComparaisonTypeEnum } from '../enums/comparaison.enum';
import { OrderEnum } from '../enums/order.enum';
import { Attribute } from './attribute';

export class Query<T> {
  @ValidateNested({ each: true })
  @Type(() => Attribute)
  @AutoMap()
  attributes: Attribute[];

  @AutoMap()
  take: number;

  @AutoMap()
  skip: number;

  @IsEnum(ComparaisonTypeEnum)
  @AutoMap()
  type: ComparaisonTypeEnum;

  @AutoMap()
  orders: {
    [P in EntityFieldsNames<T>]?: OrderEnum.ASC | OrderEnum.DESC | 1 | -1;
  };

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
