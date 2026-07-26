import { config } from 'dotenv';
config();

export const devConfig = (): { name: string; db: Record<string, never> } => ({
  name: 'dev',
  db: {},
});
