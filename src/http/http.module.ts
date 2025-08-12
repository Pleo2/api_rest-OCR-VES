import { Module } from '@nestjs/common';
import { buildAxios } from './axios.factory';
import { RATES_AXIOS } from './tokens';
import ratesConfig from 'src/config/providers/rates.config';
import { ConfigType } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: RATES_AXIOS,
      inject: [ratesConfig.KEY],
      useFactory: (cfg: ConfigType<typeof ratesConfig>) =>
        buildAxios({
          baseUrl: new URL(cfg.baseUrl, cfg.baseUrl).toString(),
          timeoutMs: cfg.timeoutMs,
          userAgent: `ocr-ves-api/${process.env.npm_package_version ?? 'dev'}`,
        }),
    },
  ],
  exports: [RATES_AXIOS],
})
export class HttpModule {}
