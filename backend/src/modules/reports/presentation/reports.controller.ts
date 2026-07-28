import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ReportsService } from '../application/reports.service';
import { PurchaseRegisterQueryDto, ReportDateRangeDto, SalesRegisterQueryDto } from './dto/report-query.dto';
import {
  CustomerBreakdownResponseDto,
  GstSummaryResponseDto,
  ProductBreakdownResponseDto,
  PurchaseRegisterResponseDto,
  SalesRegisterResponseDto,
  SupplierBreakdownResponseDto,
} from './dto/report-response.dto';

@ApiTags('reports')
@RequirePermissions('reports.view')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-register')
  async salesRegister(@Query() query: SalesRegisterQueryDto): Promise<SalesRegisterResponseDto[]> {
    const rows = await this.reportsService.salesRegister(query);
    return rows.map((r) => new SalesRegisterResponseDto(r));
  }

  @Get('purchase-register')
  async purchaseRegister(@Query() query: PurchaseRegisterQueryDto): Promise<PurchaseRegisterResponseDto[]> {
    const rows = await this.reportsService.purchaseRegister(query);
    return rows.map((r) => new PurchaseRegisterResponseDto(r));
  }

  @Get('sales-by-product')
  async salesByProduct(@Query() query: ReportDateRangeDto): Promise<ProductBreakdownResponseDto[]> {
    const rows = await this.reportsService.salesByProduct(query);
    return rows.map((r) => new ProductBreakdownResponseDto(r));
  }

  @Get('purchase-by-product')
  async purchaseByProduct(@Query() query: ReportDateRangeDto): Promise<ProductBreakdownResponseDto[]> {
    const rows = await this.reportsService.purchaseByProduct(query);
    return rows.map((r) => new ProductBreakdownResponseDto(r));
  }

  @Get('sales-by-customer')
  async salesByCustomer(@Query() query: ReportDateRangeDto): Promise<CustomerBreakdownResponseDto[]> {
    const rows = await this.reportsService.salesByCustomer(query);
    return rows.map((r) => new CustomerBreakdownResponseDto(r));
  }

  @Get('purchase-by-supplier')
  async purchaseBySupplier(@Query() query: ReportDateRangeDto): Promise<SupplierBreakdownResponseDto[]> {
    const rows = await this.reportsService.purchaseBySupplier(query);
    return rows.map((r) => new SupplierBreakdownResponseDto(r));
  }

  @Get('gst-output-summary')
  async gstOutputSummary(@Query() query: ReportDateRangeDto): Promise<GstSummaryResponseDto[]> {
    const rows = await this.reportsService.gstOutputSummary(query);
    return rows.map((r) => new GstSummaryResponseDto(r));
  }

  @Get('gst-input-summary')
  async gstInputSummary(@Query() query: ReportDateRangeDto): Promise<GstSummaryResponseDto[]> {
    const rows = await this.reportsService.gstInputSummary(query);
    return rows.map((r) => new GstSummaryResponseDto(r));
  }
}
