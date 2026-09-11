import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { HealthResponse } from '@spatial/contracts';
import { DatabaseService } from '../database/database.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'API process is responding',
    schema: {
      type: 'object',
      properties: { status: { type: 'string', enum: ['ok'] } },
      required: ['status'],
    },
  })
  live(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOkResponse({ description: 'PostgreSQL and PostGIS are reachable' })
  @ApiServiceUnavailableResponse({
    description: 'Database dependency unavailable',
  })
  async ready(): Promise<HealthResponse> {
    try {
      await this.database.checkReadiness();
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { status: 'ok' };
  }
}
