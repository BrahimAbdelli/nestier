// Domain - Builders
export * from './domain/builders/mailjet-message.builder';
export * from './domain/builders/generic-email-data.builder';

// Domain - Errors
export * from './domain/errors/email.errors';

// Domain - Ports
export * from './domain/ports/email-sender.interface';

// Domain - Services
export * from './domain/services/email-template.service';

// Domain - Value Objects
export * from './domain/value-objects/email-template';
export * from './domain/value-objects/generic-email-data';
export * from './domain/value-objects/password-reset-template-data';

// Infrastructure
export * from './infrastructure/services/email.service';
export * from './infrastructure/modules/email.module';
