import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { appConfiguration } from '../config/app.configuration';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor(
    @Inject(appConfiguration.KEY) config: ConfigType<typeof appConfiguration>,
  ) {
    this.client = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3000,
        query_timeout: 3000,
        max: 10,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }
  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  async checkReadiness(): Promise<void> {
    // Infrastructure probe only. Future spatial queries belong in domain data-access repositories.
    await this.client.$queryRaw`SELECT 1, postgis_version()`;
  }
}
