import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { loadEnvFile } from './config/load-env';

const DEFAULT_PORT = 3000;

async function bootstrap(): Promise<void> {
  loadEnvFile();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mercado de Jogadores')
    .setDescription('API REST do mercado de jogadores da liga')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(Number(process.env.PORT ?? DEFAULT_PORT));
}

void bootstrap();
