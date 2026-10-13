export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export type FieldRule = (value: string) => string | undefined;

export const required: FieldRule = (value) =>
  value.trim().length === 0 ? 'Campo obrigatório.' : undefined;

export function textLength(min: number, max: number): FieldRule {
  return (value) => {
    const length = [...value.trim().replace(/ {2,}/g, ' ')].length;
    return length < min || length > max ? `Use de ${min} a ${max} caracteres.` : undefined;
  };
}

export function integerRange(min: number, max: number): FieldRule {
  return (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max
      ? undefined
      : `Informe um inteiro de ${min} a ${max}.`;
  };
}

export function validateFields<Field extends string>(
  values: Record<Field, string>,
  rules: Partial<Record<Field, FieldRule[]>>,
): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {};
  (Object.keys(rules) as Field[]).forEach((field) => {
    const message = rules[field]!.map((rule) => rule(values[field])).find(Boolean);
    if (message) {
      errors[field] = message;
    }
  });
  return errors;
}

export function hasErrors<Field extends string>(errors: FieldErrors<Field>): boolean {
  return Object.keys(errors).length > 0;
}
