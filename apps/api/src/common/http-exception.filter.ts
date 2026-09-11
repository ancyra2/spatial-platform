import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '@spatial/contracts';
import { isRecord } from '@spatial/util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    if (statusCode < 500 && exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') message = body;
      else if (isRecord(body)) {
        const candidate = body['message'];
        if (
          typeof candidate === 'string' ||
          (Array.isArray(candidate) &&
            candidate.every((item) => typeof item === 'string'))
        )
          message = candidate;
      }
    }
    if (statusCode >= 500)
      this.logger.error({
        event: 'request_failed',
        statusCode,
        path: request.path,
      });
    const body: ApiErrorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.path,
    };
    response.status(statusCode).json(body);
  }
}
