export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  dbStatementTimeoutMs: number;
  logLevel: string;
  /** Parent domain for tenant subdomains, e.g. "enrix.in" so <code>.enrix.in resolves the tenant. Empty = disabled. */
  baseDomain: string;
  auth: {
    accessTokenSecret: string;
    accessTokenTtl: string;
    refreshTokenSecret: string;
    refreshTokenTtlSeconds: number;
    otpTtlSeconds: number;
  };
  email: {
    provider: 'console' | 'smtp';
    fromAddress: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpSecure?: boolean;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbStatementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS ?? '15000', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  baseDomain: (process.env.BASE_DOMAIN ?? '').toLowerCase().trim(),
  auth: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
    refreshTokenTtlSeconds: parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS ?? String(30 * 24 * 3600), 10),
    otpTtlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '600', 10),
  },
  email: {
    provider: (process.env.EMAIL_PROVIDER as 'console' | 'smtp') ?? 'console',
    fromAddress: process.env.EMAIL_FROM ?? 'no-reply@vrindavan.local',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpSecure: process.env.SMTP_SECURE === 'true',
  },
});
