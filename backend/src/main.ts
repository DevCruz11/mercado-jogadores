import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadEnvFile } from './config/load-env';
import { HttpExceptionFilter } from './common/http/http-exception.filter';
import { jsonBodyParser } from './common/http/json-body.middleware';
import { API_PREFIX } from './common/http/location';
import { requestLogger } from './common/http/request-logger.middleware';

const DEFAULT_PORT = 3000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

async function bootstrap(): Promise<void> {
  loadEnvFile();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.use(requestLogger());
  app.use(jsonBodyParser());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mercado de Jogadores')
    .setDescription('API REST do mercado de jogadores da liga')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(Number(process.env.PORT ?? DEFAULT_PORT));
}

void bootstrap();
