import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '@shared/common/error-handling/domain/errors/application-error.interface';

export class UserErrors {
  public static USER_NOT_FOUND(userId: string): ApplicationError {
    return {
      code: 'USER_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      message: 'User not found.',
      metadata: userId
    };
  }

  public static USER_USERNAME_REQUIRED(): ApplicationError {
    return {
      code: 'USER_USERNAME_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Username is required and cannot be empty.',
    };
  }

  public static USER_USERNAME_INVALID_LENGTH(username: string): ApplicationError {
    return {
      code: 'USER_USERNAME_INVALID_LENGTH',
      status: HttpStatus.BAD_REQUEST,
      message: `Username '${username}' must be between 3 and 30 characters.`,
      metadata: username
    };
  }

  public static USER_USERNAME_INVALID_CHARACTERS(username: string): ApplicationError {
    return {
      code: 'USER_USERNAME_INVALID_CHARACTERS',
      status: HttpStatus.BAD_REQUEST,
      message: `Username '${username}' contains invalid characters. Only letters, numbers, and underscores are allowed.`,
      metadata: username
    };
  }

  public static USER_EMAIL_REQUIRED(): ApplicationError {
    return {
      code: 'USER_EMAIL_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Email is required and cannot be empty.',
    };
  }

  public static USER_EMAIL_INVALID_FORMAT(email: string): ApplicationError {
    return {
      code: 'USER_EMAIL_INVALID_FORMAT',
      status: HttpStatus.BAD_REQUEST,
      message: `Email '${email}' has an invalid format.`,
      metadata: email
    };
  }

  public static USER_PASSWORD_REQUIRED(): ApplicationError {
    return {
      code: 'USER_PASSWORD_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Password is required and cannot be empty.',
    };
  }

  public static USER_PASSWORD_TOO_SHORT(): ApplicationError {
    return {
      code: 'USER_PASSWORD_TOO_SHORT',
      status: HttpStatus.BAD_REQUEST,
      message: 'Password must be at least 6 characters long.',
    };
  }

  public static USER_LASTNAME_REQUIRED(): ApplicationError {
    return {
      code: 'USER_LASTNAME_REQUIRED',
      status: HttpStatus.BAD_REQUEST,
      message: 'Last name is required and cannot be empty.',
    };
  }

  public static USER_ALREADY_EXISTS(username: string, email: string): ApplicationError {
    return {
      code: 'USER_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      message: `User with username '${username}' or email '${email}' already exists. Please choose different credentials.`,
      metadata: JSON.stringify({ username, email })
    };
  }

  public static USER_AUTHENTICATION_FAILED(): ApplicationError {
    return {
      code: 'USER_AUTHENTICATION_FAILED',
      status: HttpStatus.UNAUTHORIZED,
      message: 'Authentication failed. Invalid credentials provided.',
    };
  }

  public static USER_INVALID_RESET_TOKEN(): ApplicationError {
    return {
      code: 'USER_INVALID_RESET_TOKEN',
      status: HttpStatus.UNAUTHORIZED,
      message: 'Invalid or expired reset password token.',
    };
  }

  public static USER_RESET_TOKEN_EXPIRED(): ApplicationError {
    return {
      code: 'USER_RESET_TOKEN_EXPIRED',
      status: HttpStatus.UNAUTHORIZED,
      message: 'Reset password token has expired. Please request a new one.',
    };
  }
}

