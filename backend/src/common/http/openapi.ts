import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { z } from 'zod';

interface ObjectJsonSchema {
  properties?: Record<string, SchemaObject>;
  required?: string[];
}

function toOpenApiSchema(schema: z.ZodType): SchemaObject & ObjectJsonSchema {
  const jsonSchema = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' });
  delete jsonSchema.$schema;
  return jsonSchema as SchemaObject & ObjectJsonSchema;
}

export function ApiZodBody(schema: z.ZodType): MethodDecorator {
  return ApiBody({ schema: toOpenApiSchema(schema) });
}

export function ApiZodQuery(schema: z.ZodType): MethodDecorator {
  const { properties = {}, required = [] } = toOpenApiSchema(schema);
  return applyDecorators(
    ...Object.entries(properties).map(([name, property]) =>
      ApiQuery({ name, schema: property, required: required.includes(name) }),
    ),
  );
}
