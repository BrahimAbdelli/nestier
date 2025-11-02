import { ConfigDatabaseModel } from './models/config-database.model';

export function databaseConfig(getEntities: () => unknown[]): ConfigDatabaseModel {
  return {
    type: 'mongodb',
    url: process.env.MONGO_URL,
    entities: getEntities(),
    synchronize: false,
    cache: true,
  };
}
