import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerOptions } from './config/logger.config';

@Module({
  imports: [LoggerModule.forRoot(buildLoggerOptions())],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
