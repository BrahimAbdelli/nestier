import { UserResetPasswordRequest } from '../value-objects/user-reset-password-request';

export const USER_EMAIL_INTERFACE = 'UserEmailInterface';

export interface UserEmailInterface {
  sendPasswordResetEmail(request: UserResetPasswordRequest): Promise<void>;
}
