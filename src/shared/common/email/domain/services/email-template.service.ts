import { Injectable } from '@nestjs/common';
import { compile, TemplateDelegate } from 'handlebars';
import * as fs from 'fs';
import { ApplicationException } from '@shared/common/error-handling/domain/exceptions/application.exception';
import { EmailErrors } from '../errors/email.errors';
import { Logger } from '@shared/common/logger/logger.service';
import { EmailTemplate } from '../value-objects/email-template';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly logger: Logger) { }

  public generatePasswordResetTemplate(data: {
    username: string;
    email: string;
    actionUrl: string;
    supportEmail: string;
    resetPasswordExpiration: string;
    browserName?: string;
    ip?: string;
  }): EmailTemplate {
    const template = this.loadTemplate('reset');
    const templateData = {
      username: data.username,
      action_url: data.actionUrl,
      browser_name: data.browserName || 'Unknown Device',
      ip: data.ip || 'Unknown IP',
      support_email: data.supportEmail,
    };
    const html = template(templateData);
    const text = this.generateTextVersion(data);

    return EmailTemplate.create('Password Reset Request', html, text);
  }

  private generateTextVersion(data: {
    username: string;
    email: string;
    actionUrl: string;
    supportEmail: string;
    resetPasswordExpiration: string;
  }): string {
    return `
      Password Reset Request

      Hello ${data.username},

      You have requested to reset your password. Use the link below to reset your password:
      ${data.actionUrl}

      This link will expire in ${data.resetPasswordExpiration}.

      If you didn't request this, please ignore this email.

      For support, contact: ${data.supportEmail}
    `;
  }

  private loadTemplate(templateName: string): TemplateDelegate {
    try {
      const templatePath: string = `templates/${templateName}.hbs`;
      return compile(fs.readFileSync(templatePath, 'utf8'));
    } catch (error: unknown) {
      this.logger.error('Error loading template', { error });
      throw new ApplicationException(EmailErrors.EMAIL_TEMPLATE_LOAD_ERROR(templateName));
    }
  }
}
