import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Kysely } from 'kysely';
import { DB } from '../kysely/db.types';
import { AppClsStore } from './tenant-cls-store';

/** Repositories call this instead of touching KyselyService/the pool directly. */
@Injectable()
export class TenantDbService {
  constructor(private readonly cls: ClsService<AppClsStore>) {}

  getDb(): Kysely<DB> {
    const db = this.cls.get('tenantDb');
    if (!db) {
      throw new InternalServerErrorException(
        'No tenant-scoped database connection in request context. Is TenantConnectionInterceptor registered, and did this route resolve a tenant?',
      );
    }
    return db;
  }
}
