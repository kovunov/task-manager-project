import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException('Validation failed', {
        cause: result.error,
        description: JSON.stringify(result.error.errors),
      });
    }

    // Return the data property which contains the parsed and validated data
    return result.data;
  }
}
