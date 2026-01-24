import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { BaseErrors } from '../error-handling/domain/errors/base.errors';
import { ApplicationException } from '../error-handling/domain/exceptions/application.exception';

/**
 * Check if the given field is unique
 * @param repository  corresponding entity repository
 * @param field object containing a single field
 * @example {_id : "645ead8b586d13a6932d46dd" }
 * @throws ApplicationException if field is not unique
 */
export async function isFieldUnique<T>(repository: Repository<T>, field: object, id?: string): Promise<void> {
  const fieldKey: string = Object.keys(field)[0];
  const fieldValue = Object.values(field)[0];

  const condition: FindOptionsWhere<T> = { [fieldKey]: new RegExp(`^${fieldValue}$`, 'i') } as FindOptionsWhere<T>;
  const entity: ObjectLiteral = await repository.findOne({ where: condition });

  let isUnique: boolean = false;

  if (id) {
    if (!entity) isUnique = true;
    else isUnique = entity._id.toHexString() === id && entity[fieldKey].toLowerCase() === fieldValue.toLowerCase();
  } else isUnique = !entity;

  if (!isUnique) {
    throw new ApplicationException(BaseErrors.FIELD_NOT_UNIQUE(fieldKey, fieldValue));
  }
}
