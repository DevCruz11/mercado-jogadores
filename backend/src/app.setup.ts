import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './common/http/http-exception.filter';
import { jsonBodyParser } from './common/http/json-body.middleware';
import { API_PREFIX } from './common/http/location';
import { requestLogger } from './common/http/request-logger.middleware';

const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

export function configureApp(app: NestExpressApplication): void {
  app.use(requestLogger());
  app.use(jsonBodyParser());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN });
}
