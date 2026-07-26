import { Injectable } from '@nestjs/common';
import { compile, TemplateDelegate } from 'handlebars';
import * as fs from 'fs';
import { ApplicationException } from '@shared/common/error-handling/domain/exceptions/application.exception';
import { EmailErrors } from '../errors/email.errors';
import { Logger } from '@shared/common/logger/logger.service';
import { EmailTemplate } from '../value-objects/email-template';
import { PasswordResetTemplateData } from '../value-objects/password-reset-template-data';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly logger: Logger) {}

  public generatePasswordResetTemplate(data: PasswordResetTemplateData): EmailTemplate {
    const template: TemplateDelegate = this.loadTemplate('reset');
    const templateData = {
      username: data.username,
      action_url: data.actionUrl,
      browser_name: data.browserName || 'Unknown Device',
      ip: data.ip || 'Unknown IP',
      support_email: data.supportEmail,
    };
    const html: string = template(templateData);

    return EmailTemplate.create('Password Reset Request', html);
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
