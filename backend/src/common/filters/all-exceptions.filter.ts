import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface PostgresError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

// SQLSTATEs we hit and identified by hand while verifying Phase 1's schema (see
// /database/README.md's "Design conventions" — RESTRICT vs CASCADE, CHECK constraints).
const PG_ERROR_STATUS_MAP: Record<string, { status: HttpStatus; message: string }> = {
  '23505': { status: HttpStatus.CONFLICT, message: 'A record with this value already exists.' },
  '23503': { status: HttpStatus.CONFLICT, message: 'This record is referenced by other data and cannot be modified this way.' },
  '23001': { status: HttpStatus.CONFLICT, message: 'This record cannot be deleted because other data depends on it.' },
  '23514': { status: HttpStatus.BAD_REQUEST, message: 'This change violates a data validation rule.' },
  '23502': { status: HttpStatus.BAD_REQUEST, message: 'A required field is missing.' },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.resolve(exception);

    this.logger.error({ err: exception, path: request.url }, 'Request failed');
    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...body,
    });
  }

  private resolve(exception: unknown): { status: HttpStatus; body: Record<string, unknown> } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const body = typeof response === 'string' ? { message: response } : (response as Record<string, unknown>);
      return { status, body };
    }

    const pgError = exception as PostgresError;
    if (pgError?.code && PG_ERROR_STATUS_MAP[pgError.code]) {
      const mapped = PG_ERROR_STATUS_MAP[pgError.code];
      return {
        status: mapped.status,
        body: { message: mapped.message, error: 'DatabaseConstraintViolation' },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { message: 'An unexpected error occurred.', error: 'InternalServerError' },
    };
  }
}
