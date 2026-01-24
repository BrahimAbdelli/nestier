import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { ConfigAuthModel } from './config-auth.model';
import { ConfigDatabaseModel } from './config-database.model';
import { ConfigMailjetModel } from './config-mailjet.model';
import { ConfigProductModel } from './config-product.model';
import { ConfigServerModel } from './config-server.model';

export class ConfigModel {
  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigDatabaseModel)
  database: ConfigDatabaseModel;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigServerModel)
  server: ConfigServerModel;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigMailjetModel)
  mailjet: ConfigMailjetModel;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigAuthModel)
  auth: ConfigAuthModel;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigProductModel)
  product: ConfigProductModel;
}
