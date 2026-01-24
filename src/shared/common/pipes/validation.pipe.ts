import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { throwError } from '../utils/throw-error.utils';

type Constructor<T = any> = new (...args: any[]) => T;
type ValidationErrorMap = Record<string, string>;

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!value) {
      throw new BadRequestException('No data submitted');
    }

    const { metatype } = metadata;

    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    const transformedObject: any = plainToClass(metatype, value);
    const validationErrors: ValidationError[] = await validate(transformedObject, {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (validationErrors.length > 0) {
      const errorMap: ValidationErrorMap = this.buildErrorMap(validationErrors);
      throwError(errorMap, 'Input data validation failed');
    }

    return value;
  }

  private buildErrorMap(validationErrors: ValidationError[]): ValidationErrorMap {
    const errorMap: ValidationErrorMap = {};

    for (const validationError of validationErrors) {
      const propertyPath: string = this.resolvePropertyPath(validationError);
      const constraints: Record<string, string> = this.resolveConstraints(validationError);

      for (const [constraintKey, constraintMessage] of Object.entries(constraints)) {
        errorMap[propertyPath + constraintKey] = String(constraintMessage);
      }
    }

    return errorMap;
  }

  private resolvePropertyPath(validationError: ValidationError): string {
    let propertyPath: string = validationError.property;
    let currentError: ValidationError = validationError;

    while (currentError.constraints === undefined) {
      propertyPath += currentError.property;
      currentError = currentError.children[0];
    }

    return propertyPath;
  }

  private resolveConstraints(validationError: ValidationError): Record<string, string> {
    let currentError: ValidationError = validationError;

    while (currentError.constraints === undefined) {
      currentError = currentError.children[0];
    }

    return currentError.constraints;
  }

  private shouldValidate(metatype: Constructor): boolean {
    const primitiveTypes: Constructor[] = [String, Boolean, Number, Array, Object];
    return !primitiveTypes.includes(metatype);
  }
}
