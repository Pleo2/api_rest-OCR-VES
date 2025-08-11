import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

type HttpLatencyLabels = 'target' | 'method' | 'status' | 'outcome';
type HttpErrorLabels = 'target' | 'method' | 'reason';

export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const httpClientLatency: Histogram<HttpLatencyLabels> =
  new Histogram<HttpLatencyLabels>({
    name: 'http_client_request_duration_ms',
    help: 'Latencia de requests HTTP salientes en ms',
    labelNames: ['target', 'method', 'status', 'outcome'],
    buckets: [50, 100, 200, 400, 800, 1500, 3000, 5000, 10000],
  });

export const httpClientErrors: Counter<HttpErrorLabels> =
  new Counter<HttpErrorLabels>({
    name: 'http_client_request_errors_total',
    help: 'Errores de requests HTTP salientes',
    labelNames: ['target', 'method', 'reason'],
  });

registry.registerMetric(httpClientLatency);
registry.registerMetric(httpClientErrors);
