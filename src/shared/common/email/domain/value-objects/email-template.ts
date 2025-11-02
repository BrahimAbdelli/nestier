export class EmailTemplate {
  public subject: string;
  public html: string;

  constructor(subject: string, html: string, text: string) {
    this.subject = subject;
    this.html = html;
  }

  public static create(subject: string, html: string, text: string): EmailTemplate {
    return new EmailTemplate(subject, html, text);
  }
}
