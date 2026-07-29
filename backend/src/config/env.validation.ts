import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DB_STATEMENT_TIMEOUT_MS: Joi.number().integer().min(1000).default(15000),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),

  // Parent domain for tenant subdomains, e.g. "enrix.in" (so vrindavan.enrix.in resolves the
  // tenant from its subdomain label). Empty disables subdomain resolution (local dev / header-only).
  BASE_DOMAIN: Joi.string().allow('').default(''),

  ACCESS_TOKEN_SECRET: Joi.string().min(16).required(),
  ACCESS_TOKEN_TTL: Joi.string().default('15m'),
  REFRESH_TOKEN_SECRET: Joi.string().min(16).required(),
  REFRESH_TOKEN_TTL_SECONDS: Joi.number().integer().min(60).default(30 * 24 * 3600),
  OTP_TTL_SECONDS: Joi.number().integer().min(60).default(600),

  EMAIL_PROVIDER: Joi.string().valid('console', 'smtp').default('console'),
  EMAIL_FROM: Joi.string().email({ tlds: false }).default('no-reply@vrindavan.local'),
  SMTP_HOST: Joi.string().when('EMAIL_PROVIDER', { is: 'smtp', then: Joi.required() }),
  SMTP_PORT: Joi.number().port().when('EMAIL_PROVIDER', { is: 'smtp', then: Joi.required() }),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASSWORD: Joi.string().optional(),
  SMTP_SECURE: Joi.boolean().default(false),
});
