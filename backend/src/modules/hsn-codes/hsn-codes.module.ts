import { Module } from '@nestjs/common';
import { HsnCodesController } from './presentation/hsn-codes.controller';
import { HsnCodesService } from './application/hsn-codes.service';
import { HSN_CODE_REPOSITORY } from './domain/hsn-code.repository.interface';
import { HsnCodeKyselyRepository } from './infrastructure/hsn-code.kysely-repository';

@Module({
  controllers: [HsnCodesController],
  providers: [HsnCodesService, { provide: HSN_CODE_REPOSITORY, useClass: HsnCodeKyselyRepository }],
  exports: [HSN_CODE_REPOSITORY],
})
export class HsnCodesModule {}
