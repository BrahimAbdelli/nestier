import { GenericEmailDataBuilder } from '../builders/generic-email-data.builder';

export class GenericEmailData {
  public to: string;
  public toName: string;
  public subject: string;
  public html: string;
  public text?: string;
  public from?: string;
  public fromName?: string;
  public cc?: string[];
  public bcc?: string[];

  public static create(): GenericEmailDataBuilder {
    return new GenericEmailDataBuilder();
  }
}
