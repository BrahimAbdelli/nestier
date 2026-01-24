import { DomainException } from './domain.exception';

/**
 * Exception thrown when an entity is not found in the domain
 */
export class EntityNotFoundDomainException extends DomainException {
  constructor() {
    super('Resource not found', 'NOT_FOUND');
  }
}



