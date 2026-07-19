import { ObjectId } from 'mongodb';
import { FindOptionsWhere, Repository } from 'typeorm';
import { throwError } from './throw-error.utils';
/**
 * Find entity with matched field
 * @param repository  corresponding entity repository
 * @param field object containing single field
 * @example {_id : "645ead8b586d13a6932d46dd" }
 * {title : "some title to check if exisits"}
 * @param omitError whether to throw error if entity not found
 * @default false
 * @param insensitive if string check is case insensitive
 * @default true
 * @returns the entity found else null
 */
export async function findByField<T>(
  repository: Repository<T>,
  field: object,
  omitError = false,
  insensitive = true
): Promise<T> {
  const fieldKey: string = Object.keys(field)[0];
  const fieldValue: any = Object.values(field)[0];

  let entity: T;

  if (!fieldKey || !fieldValue) return entity;

  if (['_id', 'id'].includes(fieldKey)) {
    const id: ObjectId = new ObjectId(String(fieldValue));
    entity = await repository.findOne({ where: { _id: id } as unknown as FindOptionsWhere<T> });
  } else {
    const condition: FindOptionsWhere<T> = {
      [fieldKey]: new RegExp(`^${fieldValue}$`, insensitive ? 'i' : undefined),
    } as FindOptionsWhere<T>;
    entity = await repository.findOne({ where: condition });
  }

  if (omitError === true && !entity)
    throwError(
      { [repository.metadata.tableName]: 'Not found' },
      'Entity not found check the ' + fieldKey.replace('_', ''),
      404
    );

  return entity;
}
