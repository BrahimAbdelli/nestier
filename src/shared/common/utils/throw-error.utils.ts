import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

export function throwError(errors, message, code = HttpStatus.BAD_REQUEST) {
  throw new HttpException(
    {
      message,
      errors,
    },
    code
  );
}
