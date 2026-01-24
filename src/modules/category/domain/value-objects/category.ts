import { AutoMap } from '@automapper/classes';
import { ApplicationException } from '@shared/common/error-handling/domain/exceptions/application.exception';
import { Base } from '../../../base/domain/value-objects/base';
import { CategoryErrors } from '../errors/category.errors';

export class Category extends Base {
  @AutoMap()
  public name: string;

  @AutoMap()
  public quantity: number;

  @AutoMap()
  public description?: string;

  // Business Logic Methods
  public validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ApplicationException(CategoryErrors.CATEGORY_NAME_REQUIRED());
    }
    if (this.quantity < 0) {
      throw new ApplicationException(CategoryErrors.CATEGORY_QUANTITY_NEGATIVE(this.quantity));
    }
  }

  // Business rules for category
  public applyBusinessRules(): void {

    if (this.name.length > 100) {
      throw new ApplicationException(CategoryErrors.CATEGORY_NAME_TOO_LONG(this.name));
    }

    if (this.description && this.description.length > 500) {
      throw new ApplicationException(CategoryErrors.CATEGORY_DESCRIPTION_TOO_LONG(this.description));
    }
  }
}
