import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { buildcorsOption } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // Use FastifyAdapter for better performance
    // You can also pass options to FastifyAdapter if needed
    new FastifyAdapter({ logger: true }),
  );

  await app.register(helmet, {
    // Enable helmet for security headers
    contentSecurityPolicy: process.env.CSP === 'off' ? false : undefined,
  });

  // origins
  await app.register(cors, buildcorsOption());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Reject requests with non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit conversion of types
      },
      validationError: { target: false, value: false} // Do not expose the target or value in validation errors
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error(err);
});
