import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { CategoryModule } from "../../modules/category/category.module";
import { ProductModule } from "../../modules/product/product.module";
import { UserModule } from "../../modules/user/user.module";
import { authConfig } from "./auth-config";
import { validate } from "./config-validator";
import { databaseConfig } from "./database-config";
import { mailJetConfig } from "./mailjet-config";
import { productConfig } from "./product-config";
import { ConfigModel } from "./models/config.model";
import { serverConfig } from "./server-config";


export function configuration(): ConfigModel {
  const config: ConfigModel = {
    server: serverConfig(),
    database: databaseConfig(getEntities),
    mailjet: mailJetConfig(),
    auth: authConfig(),
    product: productConfig(),
  };
  return validate(ConfigModel, config as unknown as Record<string, unknown>);
}

export function getEntities(): EntityClassOrSchema[] {
  return [
    ...UserModule.entities,
    ...ProductModule.entities,
    ...CategoryModule.entities,
  ];
}

export function getEnvFilePath(): string[] {
  const envLocal: string = `.env.${process.env.NODE_ENV?.trim() || 'docker'}`;
  return [
    `./${envLocal}`,
    './.env',
  ];
}

export function testConfiguration(): ConfigModel {
  process.env.NODE_ENV = 'test';
  const config: ConfigModel = {
    server: serverConfig(),
    database: databaseConfig(getEntities),
    mailjet: mailJetConfig(),
    auth: authConfig(),
    product: productConfig(),
  };

  return validate(ConfigModel, config as unknown as Record<string, unknown>);
}
