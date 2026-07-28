import { Inject, Injectable } from '@nestjs/common';
import {
  CustomerBreakdownRow,
  GstSummaryRow,
  IReportsRepository,
  ProductBreakdownRow,
  PurchaseRegisterFilters,
  PurchaseRegisterRow,
  ReportDateRange,
  REPORTS_REPOSITORY,
  SalesRegisterFilters,
  SalesRegisterRow,
  SupplierBreakdownRow,
} from '../domain/report.repository.interface';

@Injectable()
export class ReportsService {
  constructor(@Inject(REPORTS_REPOSITORY) private readonly reportsRepository: IReportsRepository) {}

  salesRegister(filters: SalesRegisterFilters): Promise<SalesRegisterRow[]> {
    return this.reportsRepository.salesRegister(filters);
  }

  purchaseRegister(filters: PurchaseRegisterFilters): Promise<PurchaseRegisterRow[]> {
    return this.reportsRepository.purchaseRegister(filters);
  }

  salesByProduct(range: ReportDateRange): Promise<ProductBreakdownRow[]> {
    return this.reportsRepository.salesByProduct(range);
  }

  purchaseByProduct(range: ReportDateRange): Promise<ProductBreakdownRow[]> {
    return this.reportsRepository.purchaseByProduct(range);
  }

  salesByCustomer(range: ReportDateRange): Promise<CustomerBreakdownRow[]> {
    return this.reportsRepository.salesByCustomer(range);
  }

  purchaseBySupplier(range: ReportDateRange): Promise<SupplierBreakdownRow[]> {
    return this.reportsRepository.purchaseBySupplier(range);
  }

  gstOutputSummary(range: ReportDateRange): Promise<GstSummaryRow[]> {
    return this.reportsRepository.gstOutputSummary(range);
  }

  gstInputSummary(range: ReportDateRange): Promise<GstSummaryRow[]> {
    return this.reportsRepository.gstInputSummary(range);
  }
}
