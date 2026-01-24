export interface PasswordResetTemplateData {
  username: string;
  email: string;
  actionUrl: string;
  supportEmail: string;
  browserName?: string;
  ip?: string;
}
