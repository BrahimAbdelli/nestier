import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';
import { EntityFieldsNames } from '../../types/entity-fields-names.type';
import { ComparisonTypeEnum } from '../enums/comparison.enum';
import { OrderEnum } from '../enums/order.enum';
import { Attribute } from './attribute';

export class Query<D> {
  @ValidateNested({ each: true })
  @Type(() => Attribute)
  @AutoMap()
  attributes: Attribute[];

  @AutoMap()
  take: number;

  @AutoMap()
  skip: number;

  @IsEnum(ComparisonTypeEnum)
  @AutoMap()
  type: ComparisonTypeEnum;

  @AutoMap()
  orders: {
    [P in EntityFieldsNames<D>]?: OrderEnum.ASC | OrderEnum.DESC | 1 | -1;
  };

  @AutoMap()
  isPaginable: boolean;

  @IsEnum(OrderEnum, { each: true })
  get enumValidation(): OrderEnum[] {
    if (this.orders) {
      const values: OrderEnum[] = Object.values(this.orders);
      if (values.length > 0) {
        return values;
      }
    }
    return null;
  }
}
