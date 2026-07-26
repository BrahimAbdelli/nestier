export class MailjetMessageBuilder {
  private readonly message: Record<string, unknown> = {};

  public static create(): MailjetMessageBuilder {
    return new MailjetMessageBuilder();
  }

  public withFrom(email: string, name: string): this {
    this.message.From = {
      Email: email,
      Name: name,
    };
    return this;
  }

  public withTo(email: string, name: string): this {
    this.message.To = [
      {
        Email: email,
        Name: name,
      },
    ];
    return this;
  }

  public withSubject(subject: string): this {
    this.message.Subject = subject;
    return this;
  }

  public withContent(html: string, text?: string): this {
    this.message.HTMLPart = html;
    if (text) {
      this.message.TextPart = text;
    }
    return this;
  }

  public build(): Record<string, unknown> {
    return this.message;
  }
}
