import { Inject, Injectable } from '@nestjs/common';
import { CurrentStockRow, StockBalanceFilters } from '../domain/stock-balance.entity';
import { IStockBalanceRepository, STOCK_BALANCE_REPOSITORY } from '../domain/stock-balance.repository.interface';
import { StockLedgerEntry, StockLedgerFilters } from '../domain/stock-ledger.entity';
import { IStockLedgerRepository, STOCK_LEDGER_REPOSITORY } from '../domain/stock-ledger.repository.interface';

@Injectable()
export class StockViewsService {
  constructor(
    @Inject(STOCK_BALANCE_REPOSITORY) private readonly stockBalanceRepository: IStockBalanceRepository,
    @Inject(STOCK_LEDGER_REPOSITORY) private readonly stockLedgerRepository: IStockLedgerRepository,
  ) {}

  getCurrentStock(filters: StockBalanceFilters): Promise<CurrentStockRow[]> {
    return this.stockBalanceRepository.getCurrentStock(filters);
  }

  getLedger(filters: StockLedgerFilters): Promise<StockLedgerEntry[]> {
    return this.stockLedgerRepository.findAll(filters);
  }
}
