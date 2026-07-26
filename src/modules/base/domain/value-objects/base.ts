import { AutoMap } from '@automapper/classes';
import { transformEntity } from '@shared/common/utils/transform-entity.utlis';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export abstract class Base {
  @Transform(transformEntity)
  @AutoMap()
  public _id?: ObjectId;

  @AutoMap()
  public isDeleted?: boolean;

  @AutoMap()
  public userCreated?: ObjectId;

  @AutoMap()
  public userUpdated?: ObjectId;
}
