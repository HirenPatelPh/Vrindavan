import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PaymentMode } from '../../domain/customer-payment.entity';

const PAYMENT_MODES: PaymentMode[] = ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'];

export class CreateCustomerPaymentAllocationDto {
  @ApiProperty() @IsUUID() salesInvoiceId!: string;
  @ApiProperty() @Type(() => Number) @Min(0.01) allocatedAmount!: number;
}

export class CreateCustomerPaymentDto {
  @ApiProperty() @IsUUID() customerId!: string;
  @ApiProperty() @Type(() => Number) @Min(0.01) amount!: number;
  @ApiProperty({ enum: PAYMENT_MODES }) @IsEnum(PAYMENT_MODES) paymentMode!: PaymentMode;
  @ApiPropertyOptional() @IsOptional() @IsDateString() paymentDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({
    type: [CreateCustomerPaymentAllocationDto],
    description: 'Sum may be less than amount (unallocated remainder is treated as on-account); must never exceed it.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerPaymentAllocationDto)
  allocations!: CreateCustomerPaymentAllocationDto[];
}
