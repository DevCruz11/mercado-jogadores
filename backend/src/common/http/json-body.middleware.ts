import { json, RequestHandler } from 'express';

export const INVALID_JSON_BODY = Symbol('INVALID_JSON_BODY');

export function jsonBodyParser(): RequestHandler {
  const parse = json({ strict: false });
  return (request, response, next) => {
    parse(request, response, (error?: unknown) => {
      if (error) {
        request.body = INVALID_JSON_BODY;
      }
      next();
    });
  };
}
