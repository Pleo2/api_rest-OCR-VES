import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { buildcorsOption } from './config/cors.config';
import { getJsonBodyLimit } from './config/body.config';
import { buildMultipartOptions } from './config/multipart.config';
import { SwaggerModule, DocumentBuilder} from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // Use FastifyAdapter for better performance
    // You can also pass options to FastifyAdapter if needed
    // For example, you can set a custom body limit
    new FastifyAdapter({ logger: true, bodyLimit: getJsonBodyLimit() }),
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

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/docs', app, document, {
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
  // This is useful for handling file uploads in your application
  // You can configure the multipart options as needed
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
