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
  const fieldValue: unknown = Object.values(field)[0];
  const comparableValue: string = toComparableString(fieldValue);

  const condition: FindOptionsWhere<T> = { [fieldKey]: new RegExp(`^${comparableValue}$`, 'i') } as FindOptionsWhere<T>;
  const entity: ObjectLiteral = await repository.findOne({ where: condition });
  const isUnique: boolean = resolveFieldUniqueness(entity, fieldKey, comparableValue, id);

  if (!isUnique) {
    throw new ApplicationException(BaseErrors.FIELD_NOT_UNIQUE(fieldKey, fieldValue as string));
  }
}

function resolveFieldUniqueness(entity: ObjectLiteral, fieldKey: string, expectedValue: string, id?: string): boolean {
  if (!id) {
    return !entity;
  }
  if (!entity) {
    return true;
  }
  const entityValue: string = toComparableString(entity[fieldKey]).toLowerCase();
  return entity._id.toHexString() === id && entityValue === expectedValue.toLowerCase();
}

function toComparableString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value === null || value === undefined) {
    return '';
  }
  return JSON.stringify(value);
}
