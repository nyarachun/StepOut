import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/exception.filter.js';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

async function start() {
  const PORT = Number(process.env.PORT) || 5000;

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://nyarachun.github.io',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('Events API')
    .setDescription(
      'Documentation for backend platform events',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    'api/docs',
    app,
    document,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  app.useLogger(app.get(Logger));

  await app.listen(PORT, '0.0.0.0');
}

start();