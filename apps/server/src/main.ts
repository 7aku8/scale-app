import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { toNodeHandler } from 'better-auth/node';
import express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // BEGIN - BetterAuth workaround
  const expressApp = app.getHttpAdapter().getInstance();

  const authService = app.get<AuthService>(AuthService);

  expressApp.all(
    /^\/api\/auth\/.*/,
    toNodeHandler(authService.instance.handler),
  );

  expressApp.use(express.json());
  // END - BetterAuth workaround

  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw errors for non-whitelisted properties
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API endpoints: http://localhost:${port}/api`);
  logger.log(`WebSocket endpoint: ws://localhost:${port}/ws`);
}

bootstrap();
