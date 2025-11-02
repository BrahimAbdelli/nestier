import { FormatWrap } from 'logform';
import * as winston from 'winston';

export const messageFormatter: FormatWrap = winston.format((info: winston.Logform.TransformableInfo) => info);

export const errorMetadata: FormatWrap = winston.format((info: winston.Logform.TransformableInfo) => {
  if (info.error instanceof Error) {
    info.error = {
      name: info.error.name,
      message: info.error.message,
    };
  }
  return info;
});
