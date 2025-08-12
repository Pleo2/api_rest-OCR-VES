import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().port().default(8080),
  LOG_LEVEL: Joi.string()
    .valid('debug', 'info', 'warn', 'error')
    .default('info'),

  /// OCR (Replicate)
  //   REPLICATE_API_TOKEN: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required(), otherwise: Joi.optional() }),
  //   REPLICATE_MODEL: Joi.string().default('abiruyt/text-extract-ocr'),
  //   REPLICATE_TIMEOUT_MS: Joi.number().min(1000).default(15000),

  // Tasas (pydolarve)
  PYDOLARVE_BASE_URL: Joi.string().uri().required(),
  PYDOLARVE_TIMEOUT_MS: Joi.number().min(1000),
  RATES_TTL_SECONDS: Joi.number().min(30),
  RATES_ENDPOINT_API_VERSION: Joi.string(),

  // Caché
  //   CACHE_STORE: Joi.string().valid('memory','redis').default('memory'),
  //   REDIS_HOST: Joi.string().hostname().when('CACHE_STORE', { is: 'redis', then: Joi.required(), otherwise: Joi.optional() }),
  //   REDIS_PORT: Joi.number().port().default(6379),
  //   REDIS_PASSWORD: Joi.string().allow(''),

  // CORS
  CORS_ORIGINS: Joi.string().default('*'),
  CORS_CREDENTIALS: Joi.boolean().default(false),

  // Body limits
  JSON_BODY_LIMIT_MB: Joi.number().min(1).default(1),

  // Multipart
  MULTIPART_MAX_FILE_SIZE_MB: Joi.number().min(1).default(5),
  MULTIPART_MAX_FILES: Joi.number().min(1).default(1),
  MULTIPART_MAX_FIELDS: Joi.number().min(0).default(10),
  MULTIPART_TOTAL_PARTS: Joi.number().min(1).default(20),
  ACCEPTED_IMAGE_MIME_TYPES: Joi.string().default(
    'image/jpeg,image/png,image/webp',
  ),

  // CSP/Docs
  CSP: Joi.string().valid('off').optional(),
});
