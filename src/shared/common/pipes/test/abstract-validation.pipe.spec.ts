import { ValidationPipeOptions } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AbstractValidationPipe } from '../abstract-validation.pipe';

class BodyDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

class QueryDto {
  @IsNotEmpty()
  @IsString()
  filter: string;
}

class ParamDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

describe('AbstractValidationPipe', () => {
  const options: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  };

  describe('transform', () => {
    it('should apply correct DTO based on metadata type', async () => {
      const pipe: AbstractValidationPipe = new AbstractValidationPipe(options, {
        body: BodyDto,
        query: QueryDto,
        param: ParamDto,
      });

      const bodyResult: object = await pipe.transform(
        { name: 'test' },
        { type: 'body', metatype: undefined, data: '' }
      );
      const queryResult: object = await pipe.transform(
        { filter: 'active' },
        { type: 'query', metatype: undefined, data: '' }
      );
      const paramResult: object = await pipe.transform({ id: '123' }, { type: 'param', metatype: undefined, data: '' });

      expect(bodyResult).toEqual({ name: 'test' });
      expect(queryResult).toEqual({ filter: 'active' });
      expect(paramResult).toEqual({ id: '123' });
    });

    it('should validate against mapped DTO', async () => {
      const pipe: AbstractValidationPipe = new AbstractValidationPipe(options, { body: BodyDto });

      await expect(pipe.transform({ name: '' }, { type: 'body', metatype: undefined, data: '' })).rejects.toThrow();
    });

    it('should fall back to parent validation when no target type mapped', async () => {
      const pipe: AbstractValidationPipe = new AbstractValidationPipe(options, { body: BodyDto });

      const result: object = await pipe.transform({ filter: 'test' }, { type: 'query', metatype: QueryDto, data: '' });

      expect(result).toEqual({ filter: 'test' });
    });

    it('should reject non-whitelisted fields', async () => {
      const pipe: AbstractValidationPipe = new AbstractValidationPipe(options, { body: BodyDto });

      await expect(
        pipe.transform({ name: 'test', extra: 'field' }, { type: 'body', metatype: undefined, data: '' })
      ).rejects.toThrow();
    });

    it('should work with partial configuration', async () => {
      const pipe: AbstractValidationPipe = new AbstractValidationPipe(options, { body: BodyDto });

      const bodyResult: object = await pipe.transform(
        { name: 'test' },
        { type: 'body', metatype: undefined, data: '' }
      );
      expect(bodyResult).toEqual({ name: 'test' });

      const queryResult: object = await pipe.transform(
        { filter: 'test' },
        { type: 'query', metatype: QueryDto, data: '' }
      );
      expect(queryResult).toEqual({ filter: 'test' });
    });
  });
});
