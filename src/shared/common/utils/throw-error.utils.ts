import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

export function throwError(errors: unknown, message: string, code: number = HttpStatus.BAD_REQUEST): never {
  throw new HttpException(
    {
      message,
      errors,
    },
    code
  );
}
