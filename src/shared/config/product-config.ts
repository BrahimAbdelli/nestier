import { ConfigProductModel } from './models/config-product.model';

export function productConfig(): ConfigProductModel {
  const restrictedWordsEnv: string = process.env.RESTRICTED_WORDS;

  return {
    restrictedWords: restrictedWordsEnv
      .split(',')
      .map((word: string) => word.trim().toLowerCase())
      .filter((word: string) => word.length > 0),
  };
}
