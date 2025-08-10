### Plan técnico: API REST OCR VES con NestJS

Este documento organiza la implementación de una API para: (1) extraer el monto en bolívares desde imágenes de habladores de precio usando OCR con IA, y (2) convertir ese monto según distintas tasas de referencia disponibles públicamente.

- **Fuentes**:
  - Tasas: [pydolarve.org](https://pydolarve.org/)
  - OCR: [abiruyt/text-extract-ocr en Replicate](http://replicate.com/abiruyt/text-extract-ocr)

### Objetivo

- **Extraer** el monto (en VES) desde una imagen (subida o por URL) con OCR.
- **Obtener** tasas de cambio desde fuente pública (pydolarve) y **convertir** a USD y/o otras referencias.
- **Entregar** un backend robusto, escalable y mantenible siguiendo buenas prácticas de NestJS.

### Arquitectura (modular)

- **Módulo `rates`**: obtención, normalización y caché de tasas (HTTP client → pydolarve).
- **Módulo `ocr`**: integración con proveedor OCR (Replicate) tras una interfaz (proveedor intercambiable).
- **Módulo `conversion`**: lógica para convertir montos VES ↔ divisas según tasas vigentes.
- **Módulo `http` (infra)**: clientes Axios, interceptores, timeouts, retries, circuit breakers.
- **Módulo `config`**: carga/validación de variables de entorno.
- **Módulo `health`**: endpoints de salud y readiness.
- **Módulo `observability`**: logging estructurado, métricas y trazas.

### Dependencias recomendadas

- Núcleo: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-fastify` (ya presente).
- Configuración: `@nestjs/config`, `zod` o `joi` para validar env.
- HTTP: `@nestjs/axios`, `axios`, `axios-retry`.
- Documentación: `@nestjs/swagger`, `swagger-ui-express` o Fastify-compat.
- Validación DTO: `class-validator`, `class-transformer`.
- Seguridad: `@fastify/helmet`, `@fastify/cors`, `@nestjs/throttler`.
- Caché: `@nestjs/cache-manager`, `cache-manager`, opcional `cache-manager-redis-store` o `ioredis`.
- Observabilidad: `nestjs-pino` o `pino-http` + `prom-client` (Prometheus), opcional `@nestjs/terminus` (health), `nestjs-otel`.
- Subida de archivos: `@fastify/multipart` o `multer` según estrategia.
- OCR: SDK oficial `replicate` o consumo directo de API HTTP; alternativamente, contenedor local del modelo si aplica.

### Variables de entorno (sugeridas)

```
# App
PORT=3000
NODE_ENV=development

# OCR - Replicate
REPLICATE_API_TOKEN=your-token
REPLICATE_MODEL=abiruyt/text-extract-ocr
REPLICATE_TIMEOUT_MS=15000

# Tasas - pydolarve
PYDOLARVE_BASE_URL=https://pydolarve.org
PYDOLARVE_TIMEOUT_MS=8000
RATES_TTL_SECONDS=60

# Caché
CACHE_STORE=memory            # memory | redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Endpoints v1 (propuesta)

- `GET /health` → ok, uptime, dependencias básicas.
- `GET /rates/current?providers=bcv,parallel,avg` → tasas actuales normalizadas con TTL de caché.
- `POST /ocr/extract` → body con `imageUrl` o upload de archivo; responde `{ text, amountVES?, confidence? }`.
- `POST /convert` → `{ amountVES: number, providers?: string[] }` → `{ base: {ves}, quotes: { usd_by_bcv, usd_by_parallel, ... } }`.
- `POST /ocr/ves/convert` → `{ imageUrl|file, providers? }` → combina OCR + conversión en un paso.
- `GET /docs` → Swagger UI.

Notas:

- `providers` son etiquetas lógicas que el módulo `rates` mapea a las fuentes de pydolarve (p. ej., `bcv`, `parallel`, `avg`). La lista final depende de lo que exponga públicamente pydolarve; se recomienda parametrizarla en config.

### Flujo principal (/ocr/ves/convert)

1. Validar payload (URL o archivo, límites de tamaño y tipo).
2. Enviar imagen al proveedor OCR (Replicate) y recibir texto crudo.
3. Parsear el texto para extraer un número VES robusto (manejo de `Bs.`, separadores coma/punto, millares).
4. Consultar tasas actuales al módulo `rates` (con caché y fallback en error temporal).
5. Calcular conversiones y retornar respuesta unificada.

### Diseño de módulos

- **rates**
  - Servicio HTTP con `AxiosInstance` dedicado: baseURL=`PYDOLARVE_BASE_URL`, timeouts, retries exponenciales, circuit breaker opcional.
  - Normalizador de respuesta → `RateQuote` con `{ provider, base: "VES", quote: "USD", rate, at }`.
  - Estrategia de caché (in-memory/Redis) con `RATES_TTL_SECONDS`.

- **ocr**
  - Interfaz `OcrProvider` con método `extractText(input: { imageUrl?: string; buffer?: Buffer })`.
  - Implementación `ReplicateOcrProvider` (usa `REPLICATE_API_TOKEN`, `REPLICATE_MODEL`).
  - Parseo semántico `parseVesAmount(text: string)` con heurísticas (símbolos `Bs`, `Bs.`, `Bs,`, separadores), y score de confianza.

- **conversion**
  - Servicio `ConversionService` que recibe `amountVES` + `RateQuote[]` y produce cotizaciones (redondeo configurable, p. ej. 2–4 decimales).
  - Opcional: políticas de redondeo y presentación por proveedor.

### Seguridad

- **CORS** (lista de orígenes permitidos por env), **Helmet** (Fastify plugin), **Throttler** (rate limiting por IP y ruta).
- **Validación** con `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- **Límites** de tamaño de payload (imágenes) y tipos MIME permitidos.
- **API Key** opcional via `x-api-key` para endpoints de conversión/OCR si se expone públicamente.

### Observabilidad y registro

- **Logging estructurado** con `nestjs-pino` (correlación por request-id, tiempos y tamaños).
- **Métricas** con `prom-client` (latencia por endpoint, tasa de errores, aciertos de caché). Exponer `GET /metrics` (si aplica).
- **Health** con `@nestjs/terminus`: comprobar HTTP a pydolarve, Redis y proveedor OCR (shallow ping).
- **Trazas**: `nestjs-otel` opcional para OpenTelemetry.

### Rendimiento y resiliencia

- **Caché** para tasas y, opcionalmente, OCR (hash de imagen → texto) con TTL corto.
- **Retries** con backoff (solo idempotentes) y **circuit breaker** ante fallos sostenidos.
- **Timeouts** defensivos (HTTP y OCR) con cancelación.

### Pruebas

- Unitarias: parseo `parseVesAmount`, normalizadores de tasas, DTOs.
- Integración: `rates` con `nock`/mocks HTTP; `ocr` con stub del proveedor.
- E2E: flujos `/ocr/ves/convert` y `/convert`; validar esquemas y errores.

### Documentación y DX

- **Swagger** con DTOs bien tipados (request/response) y ejemplos.
- **Ejemplos** de payload para uploads y `imageUrl`.
- **Errores** documentados (códigos y mensajes estandarizados).

### Roadmap por fases

- **Fase 1 (MVP)**
  - Módulos `rates`, `ocr`, `conversion` y `health`.
  - Endpoints: `/rates/current`, `/ocr/extract`, `/convert`, `/ocr/ves/convert`, `/health`, `/docs`.
  - Validación, Helmet, CORS, Swagger, logs básicos.

- **Fase 2 (Robustez)**
  - Caché (Redis opcional), TTLs, rate limiting, retries, timeouts, circuit breaker.
  - Métricas Prometheus y health avanzado.
  - Tests unidad/integración/e2e con cobertura base.

- **Fase 3 (Observabilidad y calidad)**
  - Trazas (OTel), dashboards de métricas, alertas.
  - Mejoras de parseo OCR (regex/heurísticas) y locales.
  - Políticas de redondeo/presentación configurables.

- **Fase 4 (Escalabilidad/operación)**
  - Historial de conversiones (persistencia), colas (BullMQ) para OCR batch, prefetch de tasas.
  - Hardening de seguridad (API keys, WAF, quotas por cliente).

### Notas de integración

- La lista de proveedores y endpoints precisos de pydolarve debe confirmarse en su documentación pública. Parametrizar `providers` y mapearlos en `rates`.
- Replicate requiere `REPLICATE_API_TOKEN`. Se recomienda su SDK oficial o HTTP directo con `Authorization: Token ...`.
- Manejar regionalización de separadores decimales (`,` vs `.`). Preferir parseo estricto y fallback conservador.

### Esqueleto de trabajo (comandos sugeridos Nest)

```
nest g module config && nest g module http && nest g module health
nest g module rates && nest g service rates && nest g controller rates
nest g module ocr && nest g service ocr && nest g controller ocr
nest g module conversion && nest g service conversion && nest g controller conversion
```

### Ejemplos de respuesta (resumen)

- `GET /rates/current`

```
{
  "providers": [
    { "provider": "bcv", "base": "VES", "quote": "USD", "rate": 36.50, "at": "2025-01-01T12:00:00Z" }
  ]
}
```

- `POST /ocr/ves/convert`

```
{
  "input": { "imageUrl": "https://.../hablador.jpg" },
  "result": {
    "amountVES": 125.50,
    "quotes": {
      "usd_by_bcv": 3.44,
      "usd_by_parallel": 3.40
    }
  }
}
```

### Referencias

- Tasas: [pydolarve.org](https://pydolarve.org/)
- OCR: [abiruyt/text-extract-ocr en Replicate](http://replicate.com/abiruyt/text-extract-ocr)

### Roadmap detallado por módulos (acciones y criterios)

1. Configuración base y seguridad (App bootstrap)

- Acciones:
  - Habilitar `ValidationPipe` global (whitelist, transform, forbidNonWhitelisted).
  - Registrar `@fastify/helmet` y `@fastify/cors` con orígenes desde env.
  - Límite de payload para imágenes (multipart) y JSON.
  - Registrar Swagger en `/docs` (título, versión, tags) y DTOs con ejemplos.
  - Logging con `nestjs-pino` y correlación `request-id`.
- Criterios de aceptación:
  - Peticiones inválidas retornan 400 con mensajes claros.
  - CORS y Helmet activos verificados con respuestas de cabeceras.
  - Swagger accesible y enumera endpoints base.

2. Módulo `config`

- Acciones:
  - Cargar `.env` y validar con `zod`/`joi` (PORT, REPLICATE*\*, PYDOLARVE*\_, CACHE\_\_).
  - Exponer `ConfigService` tipado.
- Criterios:
  - App no arranca si faltan variables críticas.
  - Tests unitarios para esquemas de env.

3. Módulo `http` (infra)

- Acciones:
  - Crear `HttpModule` con `AxiosInstance` preconfigurado (timeouts, user-agent, retries con `axios-retry`).
  - Interceptores: logging de requests externos y métricas (latencia, errores).
  - Circuit breaker simple (estado/contador, cooldown) para proveedores externos.
- Criterios:
  - Retries solo en idempotentes y ante códigos/transitorios definidos.
  - Métricas expuestas para llamadas externas.

4. Módulo `rates`

- Acciones:
  - Cliente a pydolarve usando `HttpModule` (baseURL, timeouts, retries).
  - Normalizador de respuesta a `RateQuote` unificado.
  - Caché in-memory con TTL (`RATES_TTL_SECONDS`); provider para Redis opcional.
  - Endpoint `GET /rates/current?providers=...` con validación de `providers`.
- Criterios:
  - Respuesta consistente entre distintos proveedores solicitados.
  - TTL respeta cacheo y `cache hit` observable en logs/métricas.
  - Tests unitarios (normalizador) e integración (mocks HTTP) verdes.

5. Módulo `ocr`

- Acciones:
  - Interfaz `OcrProvider`; implementación `ReplicateOcrProvider` (token, modelo, timeout, manejo de errores HTTP).
  - Servicio `OcrService.extractText({ imageUrl|buffer })` y `parseVesAmount(text)` con heurísticas robustas.
  - Endpoint `POST /ocr/extract` soportando `imageUrl` o `multipart` (archivo) con validación de tamaño/MIME.
- Criterios:
  - Retorna `{ text, amountVES?, confidence? }` con parseo correcto en casos comunes (con y sin símbolos `Bs`).
  - Manejo de errores de proveedor (timeouts, 4xx/5xx) con mensajes claros.
  - Tests unitarios del parser y mocks del proveedor OCR.

6. Módulo `conversion`

- Acciones:
  - Servicio `ConversionService.convert(amountVES, quotes)` que retorna mapa de cotizaciones (redondeo configurable).
  - Endpoint `POST /convert` con DTO validando número y `providers` opcional.
- Criterios:
  - Precisión de redondeo según configuración (2–4 decimales) validada por pruebas.
  - Cobertura de casos límite (0, montos grandes, decimales locales).

7. Composición OCR + conversion

- Acciones:
  - Endpoint `POST /ocr/ves/convert` que compone `ocr.extractText + rates.current + conversion.convert`.
  - Props opcionales: `providers`, redondeo.
- Criterios:
  - Flujo end-to-end probado (e2e) con imágenes de ejemplo.
  - Errores parciales (p. ej., sin monto detectable) retornan 422 con detalle.

8. Observabilidad y salud

- Acciones:
  - `@nestjs/terminus`: checks a pydolarve (HEAD/GET), Redis (si aplica) y un ping ligero a OCR.
  - `prom-client`: histograma de latencias por endpoint; contadores de errores; métricas de cache hit/miss.
  - Exponer `/health` y opcional `/metrics`.
- Criterios:
  - Tableros muestran latencia p95 y tasa de errores < umbral acordado.
  - Health refleja correctamente caídas de dependencias.

9. Seguridad reforzada

- Acciones:
  - `@nestjs/throttler` con cuotas por IP/ruta.
  - API key opcional para endpoints de OCR/conversión (guard simple por header `x-api-key`).
- Criterios:
  - Throttling efectivo bajo carga de prueba.
  - Accesos sin API key bloqueados si está habilitado.

10. Calidad y DX

- Acciones:
  - Swagger: ejemplos por endpoint y esquemas de error estandarizados.
  - Scripts `test`, `test:e2e`, `lint`, `format` en CI.
  - README con uso rápido y ejemplos cURL.
- Criterios:
  - CI verde (lint, unit, e2e) y documentación actualizada.

11. Fase de escalabilidad (opcional)

- Acciones:
  - Persistencia de historial de conversiones (PostgreSQL) y colas (BullMQ) para OCR batch.
  - Prefetch de tasas según cron + invalidación proactiva.
- Criterios:
  - Cargas batch no afectan P99 de endpoints sincrónicos.
  - Métricas estables bajo estrés.

Orden sugerido (hitos)

- H1: Base + config + seguridad mínima + Swagger.
- H2: http + rates (+ caché básica) + endpoint /rates/current.
- H3: ocr + endpoint /ocr/extract + parser confiable.
- H4: conversion + endpoint /convert.
- H5: composición /ocr/ves/convert + e2e.
- H6: observabilidad (terminus, métricas) + robustez (retries, throttler).
- H7: hardening (API key), Redis opcional y mejoras de parser.
