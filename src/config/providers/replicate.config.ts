import { registerAs } from '@nestjs/config';
export default registerAs('replicate', () => ({
  apiToken: process.env.REPLICATE_API_TOKEN!,
  model: process.env.REPLICATE_MODEL!,
  timeoutMs: Number(process.env.REPLICATE_TIMEOUT_MS),
}));

/*
USE EXAMPLE IN THE SERVICE
import { Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import replicateConfig from '../config/replicate.config';

export class OcrService {
  constructor(
    @Inject(replicateConfig.KEY)
    private readonly cfg: ConfigType<typeof replicateConfig>,
  ) {}
}
*/
