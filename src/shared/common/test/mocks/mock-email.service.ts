import { Injectable } from '@nestjs/common';
import { EmailSenderInterface } from '@shared/common/email/domain/ports/email-sender.interface';
import { GenericEmailData } from '@shared/common/email/domain/value-objects/generic-email-data';

/**
 * Mock email service for testing purposes.
 * Does not actually send emails - stores them for test assertions.
 */
@Injectable()
export class MockEmailService implements EmailSenderInterface {
  private readonly sentEmails: GenericEmailData[] = [];

  public sendEmail(emailData: GenericEmailData): Promise<void> {
    // Store the email for potential assertions in tests
    this.sentEmails.push(emailData);
    // Do nothing - mock implementation
    return Promise.resolve();
  }
}
