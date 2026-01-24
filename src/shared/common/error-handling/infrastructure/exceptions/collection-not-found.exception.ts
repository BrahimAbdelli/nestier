import { InfrastructureException } from "./infrastructure.exception";

/**
 * Exception thrown when a collection is not found (not already created)
 */
export class CollectionNotFoundException extends InfrastructureException {
  constructor(collectionName?: string) {
    super(
      collectionName ? `Collection '${collectionName}' does not exist` : 'Collection does not exist',
      'COLLECTION_NOT_FOUND',
      { collectionName }
    );
  }
}
