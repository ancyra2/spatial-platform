import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  migrations: { path: 'apps/api/prisma/migrations' },
  // Generation/validation can run without secrets; DB commands still require DATABASE_URL.
  datasource: { url: process.env['DATABASE_URL'] ?? '' },
});
