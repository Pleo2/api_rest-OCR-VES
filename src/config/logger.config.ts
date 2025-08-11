import type { Params } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export function buildLoggerOptions(): Params {
  const dev = process.env.NODE_ENV !== 'production';
  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? (dev ? 'debug' : 'info'),
      serializers: {
        req: (req: IncomingMessage) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        err: (err: Error) => ({ type: err?.name, message: err?.message }),
      },
      customAttributeKeys: {
        responseTime: 'responseTime',
      },
      customReceivedMessage: (req) => `→ ${req.method} ${req.url}`,
      customSuccessMessage: (_req, res) => `← ${res.statusCode}`,
      customErrorMessage: (_req, res, err) =>
        `× ${res.statusCode} ${err?.message ?? ''}`,
      // generate a unique request ID if not provided
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const hdr = req.headers['x-request-id'];
        const id = (Array.isArray(hdr) ? hdr[0] : hdr) ?? randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      // Add custom properties to the log
      // This can be useful for tracking requests
      customProps: (req: IncomingMessage & { id?: string }) => ({
        reqId: req.id,
      }),

      autoLogging: {
        ignore: (req: IncomingMessage) =>
          req.url?.startsWith('/health') === true,
      },

      // Use pino-pretty in development for better readability
      // In production, we use JSON format for structured logging
      // This allows us to have human-readable logs in development
      // and structured logs in production for better parsing and analysis
      // Note: pino-pretty is not used in production to avoid performance overhead
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'HH:MM:ss.l',
                // Muestra solo el mensaje y tiempo; ocultamos req/res completos
                messageFormat: '{msg} (+{rt}ms)',
                ignore: 'pid,hostname,req,res,userAgent',
              },
            }
          : undefined,
      redact:
        process.env.NODE_ENV === 'production'
          ? {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'response.headers.set-cookie',
              ],
              censor: '***',
            }
          : undefined,
    },
  };
}
