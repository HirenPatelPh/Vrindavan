import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { RefreshTokens } from '../../../infrastructure/database/kysely/db.types';
import { RefreshToken } from '../domain/refresh-token.entity';
import { IRefreshTokenRepository } from '../domain/refresh-token.repository.interface';

type RefreshTokenRow = Selectable<RefreshTokens>;

function toDomain(row: RefreshTokenRow): RefreshToken {
  return new RefreshToken(row.id, row.user_id, row.token_hash, row.expires_at, row.revoked_at, row.created_at);
}

@Injectable()
export class RefreshTokenKyselyRepository implements IRefreshTokenRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async create(id: string, userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('refresh_tokens')
      .values({ id, user_id: userId, token_hash: tokenHash, expires_at: expiresAt.toISOString() })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async findActiveById(id: string): Promise<RefreshToken | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('refresh_tokens')
      .selectAll()
      .where('id', '=', id)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .updateTable('refresh_tokens')
      .set({ revoked_at: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .updateTable('refresh_tokens')
      .set({ revoked_at: new Date().toISOString() })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();
  }
}
