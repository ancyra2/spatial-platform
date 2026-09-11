import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { AppSettings } from './config/environment';
import { HttpExceptionFilter } from './common/http-exception.filter';

export function configureApp(app: INestApplication, config: AppSettings): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: config.corsOrigins,
    credentials: false,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.enableShutdownHooks();
  if (config.swaggerEnabled) {
    const document = new DocumentBuilder()
      .setTitle('Spatial platform API')
      .setDescription('Foundation API; product name remains provisional.')
      .setVersion('1')
      .build();
    SwaggerModule.setup('api/v1/docs', app, () =>
      SwaggerModule.createDocument(app, document),
    );
  }
}
