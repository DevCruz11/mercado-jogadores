import { z } from 'zod';
import { parseBrasiliaDateTime } from '../domain/date-time';
import { characterCount, collapseSpaces, hasControlCharacters } from '../domain/text';

export const MAX_ID = 2_147_483_647;
export const POSITIVE_INTEGER_TEXT = /^[1-9]\d*$/;
const DECIMAL_TEXT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

export function normalizedText() {
  return z
    .string()
    .refine((text) => !hasControlCharacters(text), 'não pode conter caracteres de controle')
    .transform(collapseSpaces)
    .refine((text) => text.length > 0, 'não pode ficar vazio');
}

export function textLength(min: number, max: number) {
  return (text: string) => {
    const length = characterCount(text);
    return length >= min && length <= max;
  };
}

export function integerInRange(min: number, max: number) {
  return z.number().int().min(min).max(max);
}

export const bodyId = z.number().int().positive().max(MAX_ID);

export const brasiliaDateTime = z.string().transform((text, context) => {
  const date = parseBrasiliaDateTime(text);
  if (!date) {
    context.addIssue({
      code: 'custom',
      message: 'use o formato AAAA-MM-DDTHH:MM-03:00 com uma data e hora existentes',
    });
    return z.NEVER;
  }
  return date;
});

export const queryId = z
  .string()
  .refine(
    (text) => POSITIVE_INTEGER_TEXT.test(text) && Number(text) <= MAX_ID,
    'deve ser um inteiro positivo',
  )
  .transform(Number);

export function queryInteger(min: number, max: number) {
  return z
    .string()
    .refine((text) => POSITIVE_INTEGER_TEXT.test(text), 'deve ser um inteiro positivo')
    .transform(Number)
    .pipe(z.number().min(min).max(max));
}

export function queryDecimal(min: number, max: number) {
  return z
    .string()
    .refine((text) => DECIMAL_TEXT.test(text), 'deve ser um decimal com até 2 casas')
    .transform(Number)
    .pipe(z.number().min(min).max(max));
}

export function queryEnumList<const Values extends readonly [string, ...string[]]>(values: Values) {
  return z
    .string()
    .transform((text) => text.split(','))
    .pipe(z.array(z.enum(values)))
    .refine((items) => new Set(items).size === items.length, 'não pode repetir valores');
}

export const queryBoolean = z.enum(['true', 'false']).transform((text) => text === 'true');

export const queryText = z
  .string()
  .refine((text) => !hasControlCharacters(text), 'não pode conter caracteres de controle')
  .transform(collapseSpaces);
