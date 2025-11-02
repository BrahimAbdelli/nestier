import { ConfigServerModel } from "./models/config-server.model";

export function serverConfig(): ConfigServerModel {
  return {
    port: +process.env.SERVER_PORT,
    hostname: process.env.SERVER_HOST,
  };
}
