import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { AxiosInstance } from 'axios';
import ratesConfig from 'src/config/providers/rates.config';
import { RATES_AXIOS } from 'src/http/tokens';
import type {
  CurrencyChangeType,
  FormatDate,
  ChangeTypeResponse,
  CurrencyPath,
  MonitorsResponse,
} from './rates.interface';

@Injectable()
export class RatesService {
  private changeTypeCache?: { at: number; key: string; data: unknown };
  private monitorsCache?: { at: number; key: string; data: unknown };

  constructor(
    @Inject(RATES_AXIOS) private readonly http: AxiosInstance,
    @Inject(ratesConfig.KEY)
    private readonly cfg: ConfigType<typeof ratesConfig>,
  ) {}

  private fresh(ts: number) {
    return Date.now() - ts < this.cfg.ttlSeconds * 1000;
  }

  async changeType(
    currency: CurrencyChangeType,
    formatDate: FormatDate,
    roundedPrice?: boolean,
  ) {
    const key = JSON.stringify({ currency, formatDate, roundedPrice });
    if (
      this.changeTypeCache &&
      this.changeTypeCache.key === key &&
      this.fresh(this.changeTypeCache.at)
    ) {
      return this.changeTypeCache.data;
    }

    const { data } = await this.http.get<ChangeTypeResponse>('/tipo-cambio', {
      params: {
        currency,
        format_date: formatDate,
        rounded_price: roundedPrice,
      },
    });

    this.changeTypeCache = { at: Date.now(), key, data };
    return data;
  }

  async monitors(
    currency: CurrencyPath,
    q: {
      page?: string;
      monitor?: string;
      format_date?: FormatDate;
      rounded_price?: boolean;
    },
  ) {
    const key = JSON.stringify({ currency, q });
    if (
      this.monitorsCache &&
      this.monitorsCache.key === key &&
      this.fresh(this.monitorsCache.at)
    ) {
      return this.monitorsCache.data;
    }

    const { data } = await this.http.get<MonitorsResponse>('/monitors', {
      params: {
        currency,
        page: q.page,
        format_date: q.format_date,
      },
    });
    this.monitorsCache = { at: Date.now(), key, data };
    return data;
  }

  async convert(
    currency: CurrencyPath,
    q: { type: 'VES' | 'USD' | 'EUR' },
    value: number,
    page: string,
    monitor: string,
  ) {
    const { data } = await this.http.get<string>('/convert', {
      params: { currency, type: q.type, value, page, monitor },
    });
    return data;
  }

  // TODO: CONVERT VES AT BINANCE DOLAR USD, BCV EUR, BDV, VES
}
