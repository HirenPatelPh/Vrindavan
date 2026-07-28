import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MigrationsModule } from '../../infrastructure/migrations/migrations.module';
import { SignupController } from './presentation/signup.controller';
import { TenantProvisioningService } from './infrastructure/tenant-provisioning.service';

@Module({
  imports: [AuthModule, MigrationsModule],
  controllers: [SignupController],
  providers: [TenantProvisioningService],
})
export class SignupModule {}
