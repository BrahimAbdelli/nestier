import { Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { throwError } from '../utils/throw-error.utils';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<any> {
  constructor(private readonly entityName: string) {}

  public transform(params: any): ObjectId {
    if (!params?.id) throwError({ [this.entityName ? this.entityName : `${'Entity'}`]: 'Not found' }, 'No ID provided');

    if (!ObjectId.isValid(params.id))
      throwError({ [this.entityName ? this.entityName : `${'Entity'}`]: 'Not found' }, 'Check passed ID');
    return new ObjectId(String(params.id));
  }
}
