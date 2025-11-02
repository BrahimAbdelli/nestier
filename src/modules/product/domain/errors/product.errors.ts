import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '@shared/common/error-handling/domain/errors/application-error.interface';

export class ProductErrors {
  public static PRODUCT_NAME_REQUIRED(): ApplicationError {
    return {
      code: 'PRODUCT_NAME_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Product name is required and cannot be empty.',
    };
  }

  public static PRODUCT_NAME_TOO_LONG(name: string): ApplicationError {
    return {
      code: 'PRODUCT_NAME_TOO_LONG',
      status: HttpStatus.BAD_REQUEST,
      message: `Product name '${name}' exceeds the maximum length of 100 characters.`,
      metadata: name
    };
  }

  public static PRODUCT_PRICE_NEGATIVE(price: number): ApplicationError {
    return {
      code: 'PRODUCT_PRICE_NEGATIVE',
      status: HttpStatus.BAD_REQUEST,
      message: `Product price cannot be negative. Provided value: ${price}`,
      metadata: price.toString()
    };
  }

  public static PRODUCT_DESCRIPTION_REQUIRED(): ApplicationError {
    return {
      code: 'PRODUCT_DESCRIPTION_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Product description is required and cannot be empty.',
    };
  }

  public static PRODUCT_ALREADY_EXISTS(productName: string): ApplicationError {
    return {
      code: 'PRODUCT_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      message: `Product with name '${productName}' already exists. Please choose a different name.`,
      metadata: productName
    };
  }

  public static PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL(productName: string, price: number): ApplicationError {
    return {
      code: 'PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL',
      status: HttpStatus.BAD_REQUEST,
      message: `High-value product '${productName}' with price ${price} requires approval before creation.`,
      metadata: JSON.stringify({ productName, price })
    };
  }

  public static PRODUCT_NAME_CONTAINS_RESTRICTED_WORD(productName: string, restrictedWord: string): ApplicationError {
    return {
      code: 'PRODUCT_NAME_CONTAINS_RESTRICTED_WORD',
      status: HttpStatus.BAD_REQUEST,
      message: `Product name '${productName}' contains restricted word '${restrictedWord}'. Please choose a different name.`,
      metadata: JSON.stringify({ productName, restrictedWord })
    };
  }

  public static PRODUCT_PRICE_TOO_LOW(price: number): ApplicationError {
    return {
      code: 'PRODUCT_PRICE_TOO_LOW',
      status: HttpStatus.BAD_REQUEST,
      message: `Product price ${price} is too low. Minimum price is $1`,
      metadata: price.toString()
    };
  }
}
