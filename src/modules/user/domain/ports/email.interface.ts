import { UserResetPasswordRequest } from '../value-objects/user-reset-password-request';

export interface UserEmailInterface {
  sendPasswordResetEmail(request: UserResetPasswordRequest): Promise<void>;
}

export const USER_EMAIL_INTERFACE = Symbol('USER_EMAIL_INTERFACE');
