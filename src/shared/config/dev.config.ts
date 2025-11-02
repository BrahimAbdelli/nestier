import { config } from 'dotenv';
config();

export const devConfig = () => ({
  name: 'dev',
  db: {},
});
