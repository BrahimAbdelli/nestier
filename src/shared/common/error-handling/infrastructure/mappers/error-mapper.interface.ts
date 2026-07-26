import { HttpException } from '@nestjs/common';

/**
 * Interface for mapping domain/application exceptions to HTTP exceptions
 */
export interface ErrorMapper {
  /**
   * Maps a domain or application exception to an HTTP exception
   * @param error The domain or application exception
   * @returns HTTP exception
   */
  mapToHttpException(error: Error): HttpException;
}
