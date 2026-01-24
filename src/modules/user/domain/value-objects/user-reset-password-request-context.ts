export class UserResetPasswordRequestContext {
  public browserName: string;
  public ip: string;
  public actionUrl: string;
  public supportEmail: string;
  public resetPasswordExpiration: string;

  constructor(
    browserName: string,
    ip: string,
    actionUrl: string,
    supportEmail: string,
    resetPasswordExpiration: string
  ) {
    this.browserName = browserName;
    this.ip = ip;
    this.actionUrl = actionUrl;
    this.supportEmail = supportEmail;
    this.resetPasswordExpiration = resetPasswordExpiration;
  }

  public static create(): UserResetPasswordRequestContextBuilder {
    return new UserResetPasswordRequestContextBuilder();
  }
}

export class UserResetPasswordRequestContextBuilder {
  private browserName: string;
  private ip: string;
  private actionUrl: string;
  private supportEmail: string;
  private resetPasswordExpiration: string;

  public withBrowserName(browserName: string): this {
    this.browserName = browserName;
    return this;
  }

  public withIp(ip: string): this {
    this.ip = ip;
    return this;
  }

  public withActionUrl(actionUrl: string): this {
    this.actionUrl = actionUrl;
    return this;
  }

  public withSupportEmail(supportEmail: string): this {
    this.supportEmail = supportEmail;
    return this;
  }

  public withResetPasswordExpiration(resetPasswordExpiration: string): this {
    this.resetPasswordExpiration = resetPasswordExpiration;
    return this;
  }

  public build(): UserResetPasswordRequestContext {
    return new UserResetPasswordRequestContext(
      this.browserName,
      this.ip,
      this.actionUrl,
      this.supportEmail,
      this.resetPasswordExpiration
    );
  }
}
