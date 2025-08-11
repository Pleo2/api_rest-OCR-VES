import { registerAs } from '@nestjs/config';
export default registerAs('rates', () => ({
  baseUrl: process.env.PYDOLARVE_BASE_URL!,
  timeoutMs: Number(process.env.PYDOLARVE_TIMEOUT_MS),
  ttlSeconds: Number(process.env.RATES_TTL_SECONDS),
}));
