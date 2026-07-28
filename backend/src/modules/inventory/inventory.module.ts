import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';

import { StockTransfersController } from './presentation/stock-transfers.controller';
import { StockAdjustmentsController } from './presentation/stock-adjustments.controller';
import { PhysicalVerificationsController } from './presentation/physical-verifications.controller';
import { DamagedStockController } from './presentation/damaged-stock.controller';
import { StockReturnsController } from './presentation/stock-returns.controller';
import { BlockedStockController } from './presentation/blocked-stock.controller';
import { ReservedStockController } from './presentation/reserved-stock.controller';
import { OpeningStockController } from './presentation/opening-stock.controller';
import { StockViewsController } from './presentation/stock-views.controller';

import { StockTransfersService } from './application/stock-transfers.service';
import { StockAdjustmentsService } from './application/stock-adjustments.service';
import { PhysicalVerificationsService } from './application/physical-verifications.service';
import { DamagedStockService } from './application/damaged-stock.service';
import { StockReturnsService } from './application/stock-returns.service';
import { BlockedStockService } from './application/blocked-stock.service';
import { ReservedStockService } from './application/reserved-stock.service';
import { OpeningStockService } from './application/opening-stock.service';
import { StockViewsService } from './application/stock-views.service';

import { STOCK_TRANSFER_REPOSITORY } from './domain/stock-transfer.repository.interface';
import { STOCK_ADJUSTMENT_REPOSITORY } from './domain/stock-adjustment.repository.interface';
import { PHYSICAL_VERIFICATION_REPOSITORY } from './domain/physical-verification.repository.interface';
import { DAMAGED_STOCK_REPOSITORY } from './domain/damaged-stock.repository.interface';
import { STOCK_RETURN_REPOSITORY } from './domain/stock-return.repository.interface';
import { BLOCKED_STOCK_REPOSITORY } from './domain/blocked-stock.repository.interface';
import { RESERVED_STOCK_REPOSITORY } from './domain/reserved-stock.repository.interface';
import { STOCK_BALANCE_REPOSITORY } from './domain/stock-balance.repository.interface';
import { STOCK_LEDGER_REPOSITORY } from './domain/stock-ledger.repository.interface';

import { StockTransferKyselyRepository } from './infrastructure/stock-transfer.kysely-repository';
import { StockAdjustmentKyselyRepository } from './infrastructure/stock-adjustment.kysely-repository';
import { PhysicalVerificationKyselyRepository } from './infrastructure/physical-verification.kysely-repository';
import { DamagedStockKyselyRepository } from './infrastructure/damaged-stock.kysely-repository';
import { StockReturnKyselyRepository } from './infrastructure/stock-return.kysely-repository';
import { BlockedStockKyselyRepository } from './infrastructure/blocked-stock.kysely-repository';
import { ReservedStockKyselyRepository } from './infrastructure/reserved-stock.kysely-repository';
import { StockBalanceKyselyRepository } from './infrastructure/stock-balance.kysely-repository';
import { StockLedgerKyselyRepository } from './infrastructure/stock-ledger.kysely-repository';
import { OpeningStockKyselyRepository } from './infrastructure/opening-stock.kysely-repository';

@Module({
  imports: [ProductsModule],
  controllers: [
    StockTransfersController,
    StockAdjustmentsController,
    PhysicalVerificationsController,
    DamagedStockController,
    StockReturnsController,
    BlockedStockController,
    ReservedStockController,
    OpeningStockController,
    StockViewsController,
  ],
  providers: [
    StockTransfersService,
    StockAdjustmentsService,
    PhysicalVerificationsService,
    DamagedStockService,
    StockReturnsService,
    BlockedStockService,
    ReservedStockService,
    OpeningStockService,
    StockViewsService,
    OpeningStockKyselyRepository,
    { provide: STOCK_TRANSFER_REPOSITORY, useClass: StockTransferKyselyRepository },
    { provide: STOCK_ADJUSTMENT_REPOSITORY, useClass: StockAdjustmentKyselyRepository },
    { provide: PHYSICAL_VERIFICATION_REPOSITORY, useClass: PhysicalVerificationKyselyRepository },
    { provide: DAMAGED_STOCK_REPOSITORY, useClass: DamagedStockKyselyRepository },
    { provide: STOCK_RETURN_REPOSITORY, useClass: StockReturnKyselyRepository },
    { provide: BLOCKED_STOCK_REPOSITORY, useClass: BlockedStockKyselyRepository },
    { provide: RESERVED_STOCK_REPOSITORY, useClass: ReservedStockKyselyRepository },
    { provide: STOCK_BALANCE_REPOSITORY, useClass: StockBalanceKyselyRepository },
    { provide: STOCK_LEDGER_REPOSITORY, useClass: StockLedgerKyselyRepository },
  ],
})
export class InventoryModule {}
