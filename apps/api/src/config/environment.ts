export interface AppSettings {
  readonly environment: 'development' | 'test' | 'production';
  readonly host: string;
  readonly port: number;
  readonly corsOrigins: string[];
  readonly swaggerEnabled: boolean;
  readonly databaseUrl: string;
  readonly redisUrl: string;
}

export function parseEnvironment(env: Record<string, unknown>): AppSettings {
  const mode = env['NODE_ENV'] ?? 'development';
  if (mode !== 'development' && mode !== 'test' && mode !== 'production') {
    throw new Error('NODE_ENV must be development, test or production');
  }
  const portText = String(env['API_PORT'] ?? '3000');
  const port = Number(portText);
  if (
    !/^\d+$/.test(portText) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('API_PORT must be an integer between 1 and 65535');
  }
  const host = String(env['API_HOST'] ?? '127.0.0.1').trim();
  if (!host || /[\s/]/.test(host))
    throw new Error('API_HOST must be a hostname or IP');

  const corsOrigins = String(env['CORS_ORIGINS'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!corsOrigins.length)
    throw new Error('CORS_ORIGINS must contain explicit origins');
  for (const origin of corsOrigins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error('CORS_ORIGINS contains an invalid origin');
    }
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.origin !== origin ||
      url.username ||
      url.password
    ) {
      throw new Error(
        'CORS_ORIGINS must be exact HTTP(S) origins without paths or credentials',
      );
    }
    if (mode === 'production' && url.protocol !== 'https:')
      throw new Error('Production CORS origins must use HTTPS');
  }
  const swagger =
    env['SWAGGER_ENABLED'] ?? (mode === 'production' ? 'false' : 'true');
  if (swagger !== 'true' && swagger !== 'false')
    throw new Error('SWAGGER_ENABLED must be true or false');

  function requiredUrl(key: string, protocols: string[]): string {
    const value = env[key];
    if (typeof value !== 'string' || !value)
      throw new Error(`${key} is required`);
    try {
      const url = new URL(value);
      if (!protocols.includes(url.protocol) || !url.hostname) throw new Error();
    } catch {
      throw new Error(`${key} must be a valid connection URL`);
    }
    return value;
  }
  return {
    environment: mode,
    host,
    port,
    corsOrigins: [...new Set(corsOrigins)],
    swaggerEnabled: swagger === 'true',
    databaseUrl: requiredUrl('DATABASE_URL', ['postgres:', 'postgresql:']),
    redisUrl: requiredUrl('REDIS_URL', ['redis:', 'rediss:']),
  };
}
