import { ConfigAuthModel } from "./models/config-auth.model";

export function authConfig(): ConfigAuthModel {
  return {
    secret: process.env.SECRET,
    resetPasswordExpiration: process.env.RESET_PASSWORD_EXPIRATION,
    resetPasswordUrl: process.env.RESET_PASSWORD_URL,
    tokenExpiration: process.env.TOKEN_EXPIRATION,
    supportEmail: process.env.SUPPORT_EMAIL,
  };
}
