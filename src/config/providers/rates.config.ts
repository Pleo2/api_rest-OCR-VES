import { registerAs } from '@nestjs/config';
function parseTtlSeconds(raw: string | undefined, fallback = 60) {
  const n = Number.parseInt(raw ?? '', 10);
  const base = Number.isFinite(n) && n > 0 ? n : fallback;
  const clamped = Math.max(5, Math.min(1800, base));
  const jitter = Math.round(clamped * (0.9 + Math.random() * 0.2));
  return jitter;
}

export default registerAs('rates', () => ({
  baseUrl: process.env.PYDOLARVE_BASE_URL!,
  timeoutMs: Number.parseInt(process.env.PYDOLARVE_TIMEOUT_MS ?? '8000', 10),
  ttlSeconds: parseTtlSeconds(process.env.RATES_TTL_SECONDS, 60),
  apiPrefix: process.env.RATES_ENDPOINT_API_VERSION ?? '/api/v2',
}));
