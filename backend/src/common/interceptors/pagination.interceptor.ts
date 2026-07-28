import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Server-side pagination for any list endpoint, opt-in per request via `?page=`.
 *
 * When a request carries `?page=`, this slices the handler's array response into a
 * `{ items, total, page, limit }` page — computed on the server, so the client receives only the
 * requested page. Applied globally, this gives every `GET` that returns an array server-side
 * pagination with zero per-module code.
 *
 * It deliberately does nothing when:
 *  - `?page=` is absent (every existing caller / FK picker keeps getting the full array), or
 *  - the handler already returned a non-array (e.g. an object) — so an endpoint that does its own
 *    DB-level `LIMIT/OFFSET` pagination and returns `{ items, total }` itself (Products) passes
 *    through untouched and is never double-paginated.
 *
 * Registration order matters: this must sit *inside* [TransformResponseInterceptor] (registered
 * after it in app.module.ts) so it runs on the raw array first, then the `{ data: ... }` envelope
 * wraps the resulting page object.
 *
 * Note: this is response-level paging — the handler still fetches its full list from the DB, same
 * as it always did. That's fine for the current data sizes; a hot endpoint can later add true
 * DB-level `LIMIT/OFFSET` (returning `{ items, total }` itself) to opt out of this and cut the
 * query, exactly as Products already does.
 */
@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const pageRaw = req.query?.page;
    if (pageRaw === undefined) return next.handle();

    const page = Math.max(1, parseInt(String(pageRaw), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query?.limit ?? '12'), 10) || 12));

    return next.handle().pipe(
      map((body: unknown) => {
        if (!Array.isArray(body)) return body;
        const start = (page - 1) * limit;
        return {
          items: body.slice(start, start + limit),
          total: body.length,
          page,
          limit,
        } satisfies PaginatedResult<unknown>;
      }),
    );
  }
}
