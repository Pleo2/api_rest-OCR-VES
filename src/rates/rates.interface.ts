export type CurrencyPath = 'dollar' | 'euro';
export type FormatDate = 'default' | 'iso' | 'timestamp';
export type CurrencyChangeType = 'usd' | 'eur';
export type Page =
  | 'alcambio'
  | 'bcv'
  | 'criptodolar'
  | 'dolartoday'
  | 'enparalelovzla'
  | 'italcambio'
  | 'zoom'
  | 'binance'
  | 'bybit'
  | 'yadio';

export interface Rate {
  provider: Page;
  base: 'VES';
  quote: CurrencyPath;
  rate: number;
  timestamp: number;
}

export interface ChangeTypeResponse {
  change: number;
  color: string;
  image: string;
  last_update: string;
  last_update_old: string;
  percent: number;
  price: number;
  price_old: number;
  symbol: string;
  title: string;
}

export interface MonitorsResponse {
  datetime: { date: string; time: string };
  monitors: {
    [key: string]: {
      change: number;
      color: string;
      image: string | null;
      last_update: string;
      last_update_old: string;
      percent: number;
      price: number;
      price_old: number;
      symbol: string;
      title: string;
    };
  };
}
