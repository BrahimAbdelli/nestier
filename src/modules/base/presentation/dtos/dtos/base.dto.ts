import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { transformEntity } from '@shared/common/utils/transform-entity.utlis';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export abstract class BaseDto {
  @ApiProperty()
  @Transform(transformEntity)
  @AutoMap()
  public _id?: ObjectId;
}
