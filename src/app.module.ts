import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerOptions } from './config/logger/logger.config';
import { envSchema } from './config/env/env.schema';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './http/http.module';
import { RatesModule } from './rates/rates.module';
import replicateConfig from './config/providers/replicate.config';
import ratesConfig from './config/providers/rates.config';

@Module({
  imports: [
    LoggerModule.forRoot(buildLoggerOptions()),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [replicateConfig, ratesConfig],
      cache: true,
      validationSchema: envSchema,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`],
    }),
    HttpModule,
    RatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
