import { Module } from '@nestjs/common';
import { TenantInfoController } from './tenant-info.controller';

/** Public host → tenant resolution endpoints (branding for login + Caddy TLS gate). */
@Module({ controllers: [TenantInfoController] })
export class TenantInfoModule {}
