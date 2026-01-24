import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationPipe } from '../validation.pipe';

class SimpleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @MinLength(3)
  code: string;
}

class ChildDto {
  @IsNotEmpty()
  @IsString()
  field: string;
}

class ParentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => ChildDto)
  child: ChildDto;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  describe('transform', () => {
    it('should validate and return valid data', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: SimpleDto, data: '' };
      const validData: object = { name: 'test', value: 'data', code: 'abc' };

      const result: object = await pipe.transform(validData, metadata);

      expect(result).toEqual(validData);
    });

    it('should reject null or undefined input', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: SimpleDto, data: '' };

      await expect(pipe.transform(null, metadata)).rejects.toThrow(BadRequestException);
      await expect(pipe.transform(null, metadata)).rejects.toThrow('No data submitted');
      await expect(pipe.transform(undefined, metadata)).rejects.toThrow(BadRequestException);
    });

    it('should reject missing required fields', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: SimpleDto, data: '' };
      const incompleteData: object = { name: 'test' };

      await expect(pipe.transform(incompleteData, metadata)).rejects.toThrow();
    });

    it('should reject empty string values', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: SimpleDto, data: '' };
      const emptyData: object = { name: '', value: 'data', code: 'abc' };

      await expect(pipe.transform(emptyData, metadata)).rejects.toThrow();
    });

    it('should enforce minimum length constraints', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: SimpleDto, data: '' };
      const shortCode: object = { name: 'test', value: 'data', code: 'ab' };

      await expect(pipe.transform(shortCode, metadata)).rejects.toThrow();
    });

    it('should skip validation for primitive types', async () => {
      expect(await pipe.transform('text', { type: 'param', metatype: String, data: '' })).toBe('text');
      expect(await pipe.transform(42, { type: 'param', metatype: Number, data: '' })).toBe(42);
      expect(await pipe.transform(true, { type: 'param', metatype: Boolean, data: '' })).toBe(true);
      expect(await pipe.transform([1, 2], { type: 'body', metatype: Array, data: '' })).toEqual([1, 2]);
      expect(await pipe.transform({ key: 'val' }, { type: 'body', metatype: Object, data: '' })).toEqual({ key: 'val' });
    });

    it('should validate nested objects', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: ParentDto, data: '' };
      const validNested: object = { name: 'parent', child: { field: 'value' } };

      const result: object = await pipe.transform(validNested, metadata);

      expect(result).toEqual(validNested);
    });

    it('should reject invalid nested objects', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: ParentDto, data: '' };
      const invalidNested: object = { name: 'parent', child: { field: '' } };

      await expect(pipe.transform(invalidNested, metadata)).rejects.toThrow();
    });

    it('should reject non-whitelisted properties', async () => {
      const metadata: ArgumentMetadata = { type: 'body', metatype: SimpleDto, data: '' };
      const extraFields: object = { name: 'test', value: 'data', code: 'abc', extra: 'not allowed' };

      await expect(pipe.transform(extraFields, metadata)).rejects.toThrow();
    });
  });
});


