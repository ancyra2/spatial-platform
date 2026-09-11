import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfiguration } from '../config/app.configuration';
import { parseEnvironment } from '../config/environment';
import { HealthModule } from '../health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [appConfiguration],
      validate: (env: Record<string, unknown>) => {
        parseEnvironment(env);
        return env;
      },
    }),
    HealthModule,
  ],
})
export class AppModule {}
