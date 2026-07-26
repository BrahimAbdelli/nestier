import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { transformEntity } from '@shared/common/utils/transform-entity.utlis';
import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { BeforeInsert, BeforeUpdate, Column, ObjectIdColumn } from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty()
  @ObjectIdColumn()
  @Transform(transformEntity)
  @AutoMap()
  public _id: ObjectId;

  @Column()
  @AutoMap()
  public isDeleted: boolean;

  @Column()
  @Transform(transformEntity)
  @AutoMap()
  public userCreated: ObjectId;

  @Column()
  @Expose()
  @AutoMap()
  protected createdAt: Date;

  @Column()
  @Transform(transformEntity)
  @AutoMap()
  public userUpdated: ObjectId;

  @Column()
  @Expose()
  @AutoMap()
  protected lastUpdateAt: Date;

  /**************** ACTIONS ****************/

  @BeforeInsert()
  @BeforeUpdate()
  private beforeActions(): void {
    this.lastUpdateAt = new Date();
  }

  @BeforeInsert()
  private beforeInsertActions(): void {
    this.createdAt = new Date();
  }
}
