import axios from 'axios';
import axiosRetry, {
  exponentialDelay,
  isNetworkOrIdempotentRequestError,
} from 'axios-retry';
import http from 'node:http';
import https from 'node:https';
import { attachAxiosTelemetry } from './axios.telemetry';

export function buildAxios(options: {
  baseUrl: string;
  timeoutMs?: number;
  userAgent?: string;
}) {
  const instance = axios.create({
    baseURL: options.baseUrl,
    timeout: options.timeoutMs ?? 8000,
    headers: {
      'User-Agent': options.userAgent,
      Accept: 'application/json',
    },
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 0,
    transitional: { clarifyTimeoutError: true },
  });

  axiosRetry(instance, {
    retries: 3,
    retryDelay: exponentialDelay,
    shouldResetTimeout: true,
    retryCondition: (error) =>
      isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429,
  });

  attachAxiosTelemetry(instance, { target: new URL(options.baseUrl).host });

  return instance;
}
