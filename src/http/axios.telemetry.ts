import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { AxiosHeaders } from 'axios';
import { httpClientErrors, httpClientLatency } from '../observability/metrics';

type Cfg = InternalAxiosRequestConfig & { metadata?: { start: number } };

export function attachAxiosTelemetry(
  instance: AxiosInstance,
  opts: { target: string; getRequestId?: () => string | undefined }, // target = host/servicio
) {
  instance.interceptors.request.use((config: Cfg) => {
    config.metadata = { start: Date.now() };
    // Propaga x-request-id si está disponible
    const rid = opts.getRequestId?.();
    if (rid) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      (config.headers as InstanceType<typeof AxiosHeaders>).set(
        'x-request-id',
        rid,
      );
    }
    return config;
  });

  instance.interceptors.response.use(
    (res: AxiosResponse) => {
      const start = (res.config as Cfg).metadata?.start ?? Date.now();
      const dur = Date.now() - start;
      const labels = {
        target: opts.target,
        method: (res.config.method ?? 'GET').toUpperCase(),
        status: String(res.status),
        outcome:
          res.status >= 500 ? 'error' : res.status >= 400 ? 'fail' : 'ok',
      } as const;
      httpClientLatency.labels(labels).observe(dur);
      return res;
    },
    (err: AxiosError) => {
      const cfg = (err?.config as Cfg) ?? ({} as Cfg);
      const start = cfg.metadata?.start ?? Date.now();
      const dur = Date.now() - start;
      const status = err.response?.status ?? 0;
      const labels = {
        target: opts.target,
        method: (cfg.method ?? 'GET').toUpperCase(),
        status: String(status),
        outcome: 'error' as const,
      } as const;
      httpClientLatency.labels(labels).observe(dur);
      httpClientErrors
        .labels({
          target: opts.target,
          method: labels.method,
          reason: (err.code as string) ?? String(status || 'unknown'),
        })
        .inc(1);
      return Promise.reject(err as Error);
    },
  );
}
