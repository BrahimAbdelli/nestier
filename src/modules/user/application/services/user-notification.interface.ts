import { User } from "../../domain/value-objects/user";

export abstract class UserNotificationInterface {
  abstract sendResetPasswordEmail(user: User, resetToken: string): Promise<void>;
}
