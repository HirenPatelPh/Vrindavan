import 'reflect-metadata';
import { mkdirSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { UPLOADS_ROOT } from './modules/products/infrastructure/local-file-storage.service';

async function bootstrap(): Promise<void> {
  // Created up front so multer's diskStorage destination callback never race-creates it.
  mkdirSync(UPLOADS_ROOT, { recursive: true });

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api', { exclude: ['health', 'uploads/(.*)'] });

  // The Flutter app (web target on its own dev-server origin, plus native platforms with no
  // origin at all) is the first cross-origin browser client this API has had — every prior
  // phase was verified via curl or same-origin Swagger UI, neither of which enforces CORS.
  // `origin: true` reflects whatever origin sent the request; safe here because auth is a
  // Bearer token in a header (not a cookie), so a permissive origin doesn't expose a CSRF
  // vector the way it would for cookie-based sessions.
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-code'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vrindavan Inventory & Warehouse Management API')
    .setDescription(
      'Multi-tenant SaaS backend. Send the `x-company-code` header on every request ' +
        '(interim tenant resolution — replaced by JWT in Phase 3).',
    )
    .setVersion('0.1.0')
    .addApiKey({ type: 'apiKey', name: 'x-company-code', in: 'header' }, 'company-code')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
}

bootstrap();
