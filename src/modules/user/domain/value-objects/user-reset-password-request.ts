import { AutoMap } from "@automapper/classes";

export class UserResetPasswordRequest {
  @AutoMap()
  public to: string;

  @AutoMap()
  public toName: string;

  @AutoMap()
  public subject: string;

  @AutoMap()
  public html: string;

  @AutoMap()
  public text: string;

  @AutoMap()
  public resetToken: string;

  @AutoMap()
  public actionUrl: string;

  @AutoMap()
  public supportEmail: string;

  @AutoMap()
  public expirationTime: string;
}
