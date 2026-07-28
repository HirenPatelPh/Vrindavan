import { ApiProperty } from '@nestjs/swagger';
import { CurrentStockRow } from '../../domain/stock-balance.entity';

export class StockBalanceResponseDto {
  @ApiProperty() stockBalanceId: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() sku: string;
  @ApiProperty() warehouseId: string;
  @ApiProperty() warehouseName: string;
  @ApiProperty({ nullable: true }) rackName: string | null;
  @ApiProperty({ nullable: true }) locationName: string | null;
  @ApiProperty({ nullable: true }) batchNumber: string | null;
  @ApiProperty({ nullable: true }) expiryDate: Date | null;
  @ApiProperty() quantity: number;
  @ApiProperty() reservedQuantity: number;
  @ApiProperty() blockedQuantity: number;
  @ApiProperty() availableQuantity: number;
  @ApiProperty() averageCost: number;
  @ApiProperty() stockValue: number;

  constructor(r: CurrentStockRow) {
    this.stockBalanceId = r.stockBalanceId;
    this.productId = r.productId;
    this.productName = r.productName;
    this.sku = r.sku;
    this.warehouseId = r.warehouseId;
    this.warehouseName = r.warehouseName;
    this.rackName = r.rackName;
    this.locationName = r.locationName;
    this.batchNumber = r.batchNumber;
    this.expiryDate = r.expiryDate;
    this.quantity = r.quantity;
    this.reservedQuantity = r.reservedQuantity;
    this.blockedQuantity = r.blockedQuantity;
    this.availableQuantity = r.availableQuantity;
    this.averageCost = r.averageCost;
    this.stockValue = r.stockValue;
  }
}
