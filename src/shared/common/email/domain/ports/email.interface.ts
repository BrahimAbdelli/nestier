export class GenericEmailData {
  public to: string;
  public toName: string;
  public subject: string;
  public html: string;
  public text: string;
  public from?: string;
  public fromName?: string;
  public cc?: string[];
  public bcc?: string[];

  public static create(): GenericEmailDataBuilder {
    return new GenericEmailDataBuilder();
  }
}

export class GenericEmailDataBuilder {
  private emailData = new GenericEmailData();

  public withTo(to: string, toName: string): this {
    this.emailData.to = to;
    this.emailData.toName = toName;
    return this;
  }

  public withSubject(subject: string): this {
    this.emailData.subject = subject;
    return this;
  }

  public withContent(html: string, text: string): this {
    this.emailData.html = html;
    this.emailData.text = text;
    return this;
  }

  public withFrom(from: string, fromName: string): this {
    this.emailData.from = from;
    this.emailData.fromName = fromName;
    return this;
  }

  public withCc(cc: string[]): this {
    this.emailData.cc = cc;
    return this;
  }

  public withBcc(bcc: string[]): this {
    this.emailData.bcc = bcc;
    return this;
  }

  public build(): GenericEmailData {
    return this.emailData;
  }
}

export interface EmailInterface {
  sendEmail(emailData: GenericEmailData): Promise<void>;
}

export const EMAIL_INTERFACE = Symbol('EMAIL_INTERFACE');
