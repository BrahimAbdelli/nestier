import { AutoMap } from '@automapper/classes';
import { Base } from '../../../base/domain/value-objects/base';

export class UserLogin extends Base {
  @AutoMap()
  public email: string;

  @AutoMap()
  public password: string;
}
