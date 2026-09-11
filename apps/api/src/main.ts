import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { appConfiguration } from './config/app.configuration';
import { configureApp } from './configure-app';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(appConfiguration.KEY);
  try {
    configureApp(app, config);
    await app.listen(config.port, config.host);
  } catch (error) {
    await app.close();
    throw error;
  }
  Logger.log('API listening on /api/v1', 'Bootstrap');
}
bootstrap().catch(() => {
  Logger.error(
    'API startup failed; check environment and infrastructure configuration.',
    undefined,
    'Bootstrap',
  );
  process.exitCode = 1;
});
