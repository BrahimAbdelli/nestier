import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { UserEntity } from '../../../modules/user/infrastructure/entities/user.entity';
import { isFieldUnique } from '../utils/is-field-unique.utils';

@ValidatorConstraint({ async: true })
export class UniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource
  ) {}
  async validate(value: any, args: any): Promise<boolean> {
    const [entityClass, property] = args.constraints;
    await isFieldUnique(this.userRepository, { username: args.object.username });
    await isFieldUnique(this.userRepository, { email: args.object.email });
    const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(entityClass);
    const count: number = await repository.count({ [property]: value });
    return count === 0;
  }
}

export function Unique(entityClass: any, property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      name: 'unique',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [entityClass, property],
      options: validationOptions,
      validator: UniqueConstraint,
    });
  };
}
