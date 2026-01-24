import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../base/domain/entities/base.entity';

@Entity('product')
@Exclude()
export class ProductEntity extends BaseEntity {
  @Column()
  @AutoMap()
  public name: string;

  @Column()
  @AutoMap()
  public price: number;

  @Column()
  @AutoMap()
  public description: string;
}
