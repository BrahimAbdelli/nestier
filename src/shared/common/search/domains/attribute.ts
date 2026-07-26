import { AutoMap } from '@automapper/classes';
import { IsEnum } from 'class-validator';
import { ComparatorEnum } from '../enums/comparator.enum';

export class Attribute {
  @AutoMap()
  key: string;

  @IsEnum(ComparatorEnum)
  @AutoMap()
  comparator: ComparatorEnum;

  @AutoMap()
  value: any;
}
