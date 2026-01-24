import { AutoMap } from '@automapper/classes';
import { Base } from '../../../base/domain/value-objects/base';

export class UserUpdatePassword extends Base {
  @AutoMap()
  public token: string;

  @AutoMap()
  public password: string;
}
