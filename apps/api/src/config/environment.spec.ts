import { describe, expect, it } from 'vitest';
import { parseEnvironment } from './environment';

const valid = {
  NODE_ENV: 'test',
  CORS_ORIGINS: 'http://localhost:4200',
  DATABASE_URL: 'postgresql://localhost/test',
  REDIS_URL: 'redis://localhost:6379',
};

describe('environment validation', () => {
  it('parses defaults and explicit booleans', () => {
    expect(
      parseEnvironment({ ...valid, SWAGGER_ENABLED: 'false' }),
    ).toMatchObject({ port: 3000, swaggerEnabled: false });
  });
  it.each(['0', '65536', 'abc', '3.5', '3000junk'])(
    'rejects invalid port %s',
    (port) => {
      expect(() => parseEnvironment({ ...valid, API_PORT: port })).toThrow(
        'API_PORT',
      );
    },
  );
  it.each([
    '*',
    'https://example.com/path',
    'https://user:pass@example.com',
    'file:///tmp',
  ])('rejects unsafe origin %s', (origin) => {
    expect(() => parseEnvironment({ ...valid, CORS_ORIGINS: origin })).toThrow(
      'CORS_ORIGINS',
    );
  });
  it('requires HTTPS in production and disables docs by default', () => {
    expect(() =>
      parseEnvironment({ ...valid, NODE_ENV: 'production' }),
    ).toThrow('HTTPS');
    expect(
      parseEnvironment({
        ...valid,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://example.com',
      }).swaggerEnabled,
    ).toBe(false);
  });
  it('reports invalid connection settings without leaking their values', () => {
    expect(() =>
      parseEnvironment({ ...valid, DATABASE_URL: 'secret-value' }),
    ).toThrow('DATABASE_URL must be a valid connection URL');
    expect(() => parseEnvironment({ ...valid, REDIS_URL: '' })).toThrow(
      'REDIS_URL is required',
    );
  });
});
