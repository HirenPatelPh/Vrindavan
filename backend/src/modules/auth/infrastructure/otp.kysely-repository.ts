import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';
import { TenantDbService } from '../../../infrastructure/database/tenant-context/tenant-db.service';
import { OtpCodes } from '../../../infrastructure/database/kysely/db.types';
import { Otp, OtpPurpose } from '../domain/otp.entity';
import { IOtpRepository } from '../domain/otp.repository.interface';

type OtpRow = Selectable<OtpCodes>;

function toDomain(row: OtpRow): Otp {
  return new Otp(row.id, row.user_id, row.purpose as OtpPurpose, row.code_hash, row.expires_at, row.consumed_at, row.created_at);
}

@Injectable()
export class OtpKyselyRepository implements IOtpRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async create(userId: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date): Promise<Otp> {
    const row = await this.tenantDb
      .getDb()
      .insertInto('otp_codes')
      .values({ user_id: userId, purpose, code_hash: codeHash, expires_at: expiresAt.toISOString() })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDomain(row);
  }

  async findLatestActive(userId: string, purpose: OtpPurpose): Promise<Otp | null> {
    const row = await this.tenantDb
      .getDb()
      .selectFrom('otp_codes')
      .selectAll()
      .where('user_id', '=', userId)
      .where('purpose', '=', purpose)
      .where('consumed_at', 'is', null)
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .executeTakeFirst();
    return row ? toDomain(row) : null;
  }

  async markConsumed(id: string): Promise<void> {
    await this.tenantDb
      .getDb()
      .updateTable('otp_codes')
      .set({ consumed_at: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
  }
}
