import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { INVALID_JSON_BODY } from '../http/json-body.middleware';

z.config(z.locales.pt());

export class ZodValidationPipe<Schema extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: Schema) {}

  transform(value: unknown): z.output<Schema> {
    if (value === INVALID_JSON_BODY) {
      throw new BadRequestException('O corpo da requisição não é um JSON válido.');
    }
    const result = this.schema.safeParse(value, { reportInput: true });
    if (!result.success) {
      throw new BadRequestException(describeIssue(result.error.issues[0]));
    }
    return result.data;
  }
}

function describeIssue(issue: z.core.$ZodIssue): string {
  const field = issue.path.join('.');
  if (field.length === 0) {
    return `O corpo da requisição deve ser um objeto JSON: ${issue.message}`;
  }
  if (issue.code === 'invalid_type' && (issue.input === undefined || issue.input === null)) {
    return `O campo "${field}" é obrigatório.`;
  }
  return `O campo "${field}" é inválido: ${issue.message}`;
}
