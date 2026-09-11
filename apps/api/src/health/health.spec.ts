import 'reflect-metadata';
import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from '../configure-app';
import { parseEnvironment } from '../config/environment';
import { DatabaseService } from '../database/database.service';
import { HealthController } from './health.controller';

class ProbeDto {
  @IsString() value!: string;
}
// Test-only controller verifies global policies without adding product endpoints.
@Controller('probe')
class ProbeController {
  @Post() create(@Body() dto: ProbeDto): ProbeDto {
    return dto;
  }
  @Get('error') fail(): never {
    throw new Error('secret database detail');
  }
}

describe('HTTP foundation', () => {
  let app: INestApplication;
  const database = { checkReadiness: vi.fn() };
  beforeEach(async () => {
    database.checkReadiness.mockReset().mockResolvedValue(undefined);
    const module = await Test.createTestingModule({
      controllers: [HealthController, ProbeController],
      providers: [{ provide: DatabaseService, useValue: database }],
    }).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(
      app,
      parseEnvironment({
        NODE_ENV: 'test',
        CORS_ORIGINS: 'http://localhost:4200',
        DATABASE_URL: 'postgresql://localhost/test',
        REDIS_URL: 'redis://localhost',
        SWAGGER_ENABLED: 'true',
      }),
    );
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  it('keeps liveness independent from readiness', async () => {
    database.checkReadiness.mockRejectedValue(new Error('database offline'));
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200, { status: 'ok' });
    expect(database.checkReadiness).not.toHaveBeenCalled();
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
  });
  it('returns successful readiness', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200, { status: 'ok' });
  });
  it('rejects extra fields and invalid DTO values', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/probe')
      .send({ value: 'ok', extra: true })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/probe')
      .send({ value: 42 })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/probe')
      .send({ value: 'ok' })
      .expect(201, { value: 'ok' });
  });
  it('does not disclose unexpected error details', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/probe/error')
      .expect(500);
    expect(response.body).toMatchObject({
      statusCode: 500,
      message: 'Internal server error',
      path: '/api/v1/probe/error',
    });
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
  it('allows only configured browser origins', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:4200');
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:4200',
    );
    const denied = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'https://untrusted.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
  it('exposes prefixed OpenAPI paths and consistent 404 errors', async () => {
    const docs = await request(app.getHttpServer())
      .get('/api/v1/docs-json')
      .expect(200);
    expect(docs.body.paths).toHaveProperty('/api/v1/health');
    const missing = await request(app.getHttpServer())
      .get('/unknown')
      .expect(404);
    expect(missing.body).toMatchObject({ statusCode: 404, path: '/unknown' });
  });
});
