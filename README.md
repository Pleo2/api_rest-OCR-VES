## OCR VES API (NestJS)

API para extraer montos en bolívares desde imágenes (OCR con IA) y convertirlos según tasas públicas. Basado en NestJS + Fastify.

### Objetivo

- OCR del monto VES desde un hablador de precio usando un modelo de IA
- Conversión del monto según tasas públicas (p. ej. BCV, EUR, ETC)

Referencias:

- Tasas: https://pydolarve.org/
- OCR (modelo): http://replicate.com/abiruyt/text-extract-ocr

## Requisitos

- Node.js 18+
- pnpm 8+

## Instalación

```bash
pnpm install
```

## Variables de entorno (ejemplo)

Crear un archivo `.env` en la raíz:

```ini
# App
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Tasas (pydolarve)
PYDOLARVE_BASE_URL=https://pydolarve.org
PYDOLARVE_TIMEOUT_MS=8000
RATES_TTL_SECONDS=60

# OCR (Replicate)
REPLICATE_API_TOKEN=your-token
REPLICATE_MODEL=abiruyt/text-extract-ocr
REPLICATE_TIMEOUT_MS=15000

# CORS / Body / Multipart
CORS_ORIGINS=*
CORS_CREDENTIALS=false
JSON_BODY_LIMIT_MB=1
MULTIPART_MAX_FILE_SIZE_MB=5
MULTIPART_MAX_FILES=1
ACCEPTED_IMAGE_MIME_TYPES=image/jpeg,image/png,image/webp
```

## Ejecutar

```bash
# desarrollo
pnpm start:dev

# producción
pnpm build && pnpm start:prod
```

## Scripts útiles

```bash
pnpm format           # Prettier
pnpm lint             # ESLint
pnpm test             # Unit tests
pnpm test:e2e         # E2E tests
```

## Endpoints base

- `/` → Hello World (seed)
- `/docs` → Swagger UI (solo en no-producción)

## Arquitectura (resumen)

- `src/config/` configuración de CORS, body, multipart, logger y providers (p. ej. rates, replicate)
- `src/http/` módulo HTTP reutilizable
  - `axios.factory.ts` crea clientes Axios con timeouts, keep‑alive, retries, user‑agent
  - `axios.telemetry.ts` interceptores (latencia, errores, x-request-id)
  - `tokens.ts` tokens DI por cliente (p. ej. `RATES_AXIOS`)
  - `http.module.ts` publica clientes HTTP como providers
- `src/observability/` métricas Prometheus (latencias/errores HTTP salientes)

## Seguridad y DX

- Validación global con `ValidationPipe` (whitelist, transform)
- CORS configurable por env; Helmet activo
- Logger `nestjs-pino` con `x-request-id` y pretty en dev
- VS Code listo: ver `docs/vscode-nestjs.md`

## Flujo de integración (típico)

1. El módulo `HttpModule` crea un cliente Axios para tasas (`RATES_AXIOS`) leyendo `rates.config`.
2. El servicio de dominio (p. ej. `RatesService`) inyecta `RATES_AXIOS` y consume la API externa.
3. Los interceptores de Axios agregan métricas y `x-request-id`.
4. El controlador expone endpoints y (opcional) Swagger documenta los DTOs.

## Documentación adicional

- Plan del proyecto: `docs/plan/plan-ocr-ves.md`
- Configuración de VS Code: `docs/vscode-nestjs.md`

## Licencia

MIT
