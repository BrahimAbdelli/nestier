import { AutoMap } from '@automapper/classes';
import { ApplicationException } from '@shared/common/error-handling/domain/exceptions/application.exception';
import { Base } from '../../../base/domain/value-objects/base';
import { ProductErrors } from '../errors/product.errors';

export class Product extends Base {
  @AutoMap()
  public name: string;

  @AutoMap()
  public price: number;

  @AutoMap()
  public description: string;

  // Business Logic Methods
  public validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ApplicationException(ProductErrors.PRODUCT_NAME_REQUIRED());
    }
    if (this.price < 0) {
      throw new ApplicationException(ProductErrors.PRODUCT_PRICE_NEGATIVE(this.price));
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new ApplicationException(ProductErrors.PRODUCT_DESCRIPTION_REQUIRED());
    }
  }

  // Business rules for product
  public applyBusinessRules(): void {

    if (this.name.length > 100) {
      throw new ApplicationException(ProductErrors.PRODUCT_NAME_TOO_LONG(this.name));
    }

    if (this.price > 10000) {
      throw new ApplicationException(ProductErrors.PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL(this.name, this.price));
    }

    const restrictedWords: string[] = ['testing', 'dummy', 'fake'];
    const nameLower: string = this.name.toLowerCase();
    for (const word of restrictedWords) {
      if (nameLower.includes(word)) {
        throw new ApplicationException(ProductErrors.PRODUCT_NAME_CONTAINS_RESTRICTED_WORD(this.name, word));
      }
    }

    if (this.price > 0 && this.price < 1) {
      throw new ApplicationException(ProductErrors.PRODUCT_PRICE_TOO_LOW(this.price));
    }
  }
}
