import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';

@Module({
  providers: [RatesService],
})
export class RatesModule {}
