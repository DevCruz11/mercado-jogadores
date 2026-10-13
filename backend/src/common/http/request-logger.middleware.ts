import { Logger } from '@nestjs/common';
import { RequestHandler } from 'express';

const logger = new Logger('HTTP');

export function requestLogger(): RequestHandler {
  return (request, response, next) => {
    response.on('finish', () => {
      logger.log(`${request.method} ${request.originalUrl} ${response.statusCode}`);
    });
    next();
  };
}
