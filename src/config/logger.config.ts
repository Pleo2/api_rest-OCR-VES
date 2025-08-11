import type { Params } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export function buildLoggerOptions(): Params {
  const dev = process.env.NODE_ENV !== 'production';
  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? (dev ? 'debug' : 'info'),
      // Serializadores para reducir ruido (solo campos clave)
      serializers: {
        req: (req: IncomingMessage) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        err: (err: Error) => ({ type: err?.name, message: err?.message }),
      },
      // Renombra claves para logs más breves
      customAttributeKeys: {
        responseTime: 'responseTime',
      },
      // Mensajes compactos y legibles
      customReceivedMessage: (req) => `→ ${req.method} ${req.url}`,
      customSuccessMessage: (_req, res) => `← ${res.statusCode}`,
      customErrorMessage: (_req, res, err) =>
        `× ${res.statusCode} ${err?.message ?? ''}`,
      // Correlación de request-id por solicitud
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const hdr = req.headers['x-request-id'];
        const id = (Array.isArray(hdr) ? hdr[0] : hdr) ?? randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      // Propiedades adicionales útiles y compactas en cada log
      customProps: (req: IncomingMessage & { id?: string }) => ({
        reqId: req.id,
      }),

      autoLogging: {
        ignore: (req: IncomingMessage) =>
          req.url?.startsWith('/health') === true,
      },
      // Salida bonita en desarrollo
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
