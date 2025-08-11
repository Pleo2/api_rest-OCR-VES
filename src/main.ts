import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getJsonBodyLimit } from './config/body.config';
import { buildcorsOption } from './config/cors.config';
import { buildMultipartOptions } from './config/multipart.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // Use FastifyAdapter for better performance
    new FastifyAdapter({ logger: false, bodyLimit: getJsonBodyLimit() }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('OCR VES API')
      .setDescription('API para OCR de montos en VES y conversión con tasas')
      .setVersion('1.0.0')
      .addTag('rates')
      .addTag('ocr')
      .addTag('conversion')
      // .addBearerAuth() // si luego añades auth
      .build();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const document = SwaggerModule.createDocument(app as any, config);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    SwaggerModule.setup('/docs', app as any, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.register(helmet, {
    // Enable helmet for security headers
    contentSecurityPolicy: process.env.CSP === 'off' ? false : undefined,
  });

  // origins
  await app.register(cors, buildcorsOption());

  // Register multipart support for file uploads
  // For example, you can set limits on file size, number of files, etc.
  await app.register(fastifyMultipart, buildMultipartOptions());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Reject requests with non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit conversion of types
      },
      validationError: { target: false, value: false }, // Do not expose the target or value in validation errors
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error(err);
});
