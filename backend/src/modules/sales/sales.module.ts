import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';

import { QuotationsController } from './presentation/quotations.controller';
import { SalesOrdersController } from './presentation/sales-orders.controller';
import { DeliveryChallansController } from './presentation/delivery-challans.controller';
import { SalesInvoicesController } from './presentation/sales-invoices.controller';
import { CustomerPaymentsController } from './presentation/customer-payments.controller';
import { SalesReturnsController } from './presentation/sales-returns.controller';
import { OutstandingReceivablesController } from './presentation/outstanding-receivables.controller';

import { QuotationsService } from './application/quotations.service';
import { SalesOrdersService } from './application/sales-orders.service';
import { DeliveryChallansService } from './application/delivery-challans.service';
import { SalesInvoicesService } from './application/sales-invoices.service';
import { CustomerPaymentsService } from './application/customer-payments.service';
import { SalesReturnsService } from './application/sales-returns.service';
import { OutstandingReceivablesService } from './application/outstanding-receivables.service';

import { QUOTATION_REPOSITORY } from './domain/quotation.repository.interface';
import { SALES_ORDER_REPOSITORY } from './domain/sales-order.repository.interface';
import { DELIVERY_CHALLAN_REPOSITORY } from './domain/delivery-challan.repository.interface';
import { SALES_INVOICE_REPOSITORY } from './domain/sales-invoice.repository.interface';
import { CUSTOMER_PAYMENT_REPOSITORY } from './domain/customer-payment.repository.interface';
import { SALES_RETURN_REPOSITORY } from './domain/sales-return.repository.interface';
import { OUTSTANDING_RECEIVABLE_REPOSITORY } from './domain/outstanding-receivable.repository.interface';

import { QuotationKyselyRepository } from './infrastructure/quotation.kysely-repository';
import { SalesOrderKyselyRepository } from './infrastructure/sales-order.kysely-repository';
import { DeliveryChallanKyselyRepository } from './infrastructure/delivery-challan.kysely-repository';
import { SalesInvoiceKyselyRepository } from './infrastructure/sales-invoice.kysely-repository';
import { CustomerPaymentKyselyRepository } from './infrastructure/customer-payment.kysely-repository';
import { SalesReturnKyselyRepository } from './infrastructure/sales-return.kysely-repository';
import { OutstandingReceivableKyselyRepository } from './infrastructure/outstanding-receivable.kysely-repository';

@Module({
  imports: [ProductsModule],
  controllers: [
    QuotationsController,
    SalesOrdersController,
    DeliveryChallansController,
    SalesInvoicesController,
    CustomerPaymentsController,
    SalesReturnsController,
    OutstandingReceivablesController,
  ],
  providers: [
    QuotationsService,
    SalesOrdersService,
    DeliveryChallansService,
    SalesInvoicesService,
    CustomerPaymentsService,
    SalesReturnsService,
    OutstandingReceivablesService,
    { provide: QUOTATION_REPOSITORY, useClass: QuotationKyselyRepository },
    { provide: SALES_ORDER_REPOSITORY, useClass: SalesOrderKyselyRepository },
    { provide: DELIVERY_CHALLAN_REPOSITORY, useClass: DeliveryChallanKyselyRepository },
    { provide: SALES_INVOICE_REPOSITORY, useClass: SalesInvoiceKyselyRepository },
    { provide: CUSTOMER_PAYMENT_REPOSITORY, useClass: CustomerPaymentKyselyRepository },
    { provide: SALES_RETURN_REPOSITORY, useClass: SalesReturnKyselyRepository },
    { provide: OUTSTANDING_RECEIVABLE_REPOSITORY, useClass: OutstandingReceivableKyselyRepository },
  ],
})
export class SalesModule {}
