import { registerAs } from '@nestjs/config';
import { parseEnvironment } from './environment';

export const appConfiguration = registerAs('app', () =>
  parseEnvironment(process.env),
);
