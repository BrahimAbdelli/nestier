import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../base/infrastructure/persistence/typeorm/base.entity';

@Entity('category')
@Exclude()
export class CategoryEntity extends BaseEntity {
  @Column()
  @AutoMap()
  public name: string;

  @Column()
  @AutoMap()
  public quantity: number;

  @Column()
  @AutoMap()
  public description?: string;
}
