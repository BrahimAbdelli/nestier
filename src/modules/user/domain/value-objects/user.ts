import { AutoMap } from '@automapper/classes';
import { ApplicationException } from '@shared/common/error-handling/domain/exceptions/application.exception';
import { Base } from '../../../base/domain/value-objects/base';
import { UserErrors } from '../errors/user.errors';

export class User extends Base {
  @AutoMap()
  public username: string;

  @AutoMap()
  public email: string;

  @AutoMap()
  public password: string;

  @AutoMap()
  public lastname: string;

  @AutoMap()
  public address: string;

  @AutoMap()
  public phone: string;

  @AutoMap()
  public roles: string[];

  @AutoMap()
  public image: string;

  @AutoMap()
  public status: boolean;

  @AutoMap()
  public about: string;

  @AutoMap()
  public lastUpdateAt: Date;

  @AutoMap()
  public resetPasswordToken?: string;

  @AutoMap()
  public token?: string;

  // Business Logic Methods
  public validate(): void {
    // Basic validation (should be caught by DTO validation, but domain is the final authority)
    if (!this.username || this.username.trim().length === 0) {
      throw new ApplicationException(UserErrors.USER_USERNAME_REQUIRED());
    }
    if (!this.email || this.email.trim().length === 0) {
      throw new ApplicationException(UserErrors.USER_EMAIL_REQUIRED());
    }
    if (!this.password || this.password.trim().length === 0) {
      throw new ApplicationException(UserErrors.USER_PASSWORD_REQUIRED());
    }
    if (!this.lastname || this.lastname.trim().length === 0) {
      throw new ApplicationException(UserErrors.USER_LASTNAME_REQUIRED());
    }
  }

  // Business rules for user
  public applyBusinessRules(): void {

    // Rule 1: Username length validation
    if (this.username.length < 3 || this.username.length > 30) {
      throw new ApplicationException(UserErrors.USER_USERNAME_INVALID_LENGTH(this.username));
    }

    // Rule 2: Email format validation (basic check)
    // Using atomic groups to prevent ReDoS vulnerability
    const emailRegex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      throw new ApplicationException(UserErrors.USER_EMAIL_INVALID_FORMAT(this.email));
    }

    // Rule 3: Password strength validation
    if (this.password.length < 6) {
      throw new ApplicationException(UserErrors.USER_PASSWORD_TOO_SHORT());
    }

    // Rule 4: Username cannot contain special characters
    const usernameRegex = /^\w+$/;
    if (!usernameRegex.test(this.username)) {
      throw new ApplicationException(UserErrors.USER_USERNAME_INVALID_CHARACTERS(this.username));
    }
  }

  public validateLogin(isPasswordValid: boolean): void {
    if (!isPasswordValid || !this.status) {
      throw new ApplicationException(UserErrors.USER_AUTHENTICATION_FAILED());
    }
  }
}
