import { FastifyCorsOptions } from '@fastify/cors';

export function parseOrigins(
  raw = process.env.CORS_ORIGINS || '*',
  nodeEnv = process.env.NODE_ENV || 'development',
): FastifyCorsOptions['origin'] {
  const val = raw?.trim();
  if (!val) return nodeEnv !== 'production' ? true : [];
  if (val === '*') return true;

  return val
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildcorsOption(): FastifyCorsOptions {
  return {
    origin: parseOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposedHeaders: ['Content-Length'],
    maxAge: 86400,
  };
}
