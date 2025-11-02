
export class MailjetMessageBuilder {
  private message: Record<string, unknown> = {};

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

  public withContent(html: string, text: string): this {
    this.message.TextPart = text;
    this.message.HTMLPart = html;
    return this;
  }

  public build(): Record<string, unknown> {
    return this.message;
  }
}
