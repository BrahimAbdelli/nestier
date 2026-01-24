import { GenericEmailData } from '../value-objects/generic-email-data';

export interface EmailSenderInterface {
  sendEmail(emailData: GenericEmailData): Promise<void>;
}
