import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '@shared/common/error-handling/domain/errors/application-error.interface';

export class CategoryErrors {
  public static CATEGORY_NAME_REQUIRED(): ApplicationError {
    return {
      code: 'CATEGORY_NAME_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Category name is required and cannot be empty.',
    };
  }

  public static CATEGORY_NAME_TOO_LONG(name: string): ApplicationError {
    return {
      code: 'CATEGORY_NAME_TOO_LONG',
      status: HttpStatus.BAD_REQUEST,
      message: `Category name '${name}' exceeds the maximum length of 100 characters.`,
      metadata: name
    };
  }

  public static CATEGORY_QUANTITY_NEGATIVE(quantity: number): ApplicationError {
    return {
      code: 'CATEGORY_QUANTITY_NEGATIVE',
      status: HttpStatus.BAD_REQUEST,
      message: `Category quantity cannot be negative. Provided value: ${quantity}`,
      metadata: quantity.toString()
    };
  }

  public static CATEGORY_DESCRIPTION_TOO_LONG(description: string): ApplicationError {
    return {
      code: 'CATEGORY_DESCRIPTION_TOO_LONG',
      status: HttpStatus.BAD_REQUEST,
      message: `Category description '${description}' exceeds the maximum length of 500 characters.`,
      metadata: description
    };
  }

  public static CATEGORY_ALREADY_EXISTS(categoryName: string): ApplicationError {
    return {
      code: 'CATEGORY_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      message: `Category with name '${categoryName}' already exists. Please choose a different name.`,
      metadata: categoryName
    };
  }
}
