import { ArgumentMetadata, Injectable, Type, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: { body?: Type; query?: Type; param?: Type }
  ) {
    super(options);
  }

  public transform(value: unknown, metadata: ArgumentMetadata): Promise<any> {
    const targetType: Type | undefined = this.targetTypes[metadata.type];
    if (!targetType) {
      return super.transform(value, metadata);
    }
    return super.transform(value, { ...metadata, metatype: targetType });
  }
}
