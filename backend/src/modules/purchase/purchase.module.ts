import { Module } from '@nestjs/common';

import { PurchaseOrdersController } from './presentation/purchase-orders.controller';
import { GoodsReceivedNotesController } from './presentation/goods-received-notes.controller';
import { PurchaseInvoicesController } from './presentation/purchase-invoices.controller';
import { SupplierPaymentsController } from './presentation/supplier-payments.controller';
import { PurchaseReturnsController } from './presentation/purchase-returns.controller';
import { OutstandingPayablesController } from './presentation/outstanding-payables.controller';

import { PurchaseOrdersService } from './application/purchase-orders.service';
import { GoodsReceivedNotesService } from './application/goods-received-notes.service';
import { PurchaseInvoicesService } from './application/purchase-invoices.service';
import { SupplierPaymentsService } from './application/supplier-payments.service';
import { PurchaseReturnsService } from './application/purchase-returns.service';
import { OutstandingPayablesService } from './application/outstanding-payables.service';

import { PURCHASE_ORDER_REPOSITORY } from './domain/purchase-order.repository.interface';
import { GOODS_RECEIVED_NOTE_REPOSITORY } from './domain/goods-received-note.repository.interface';
import { PURCHASE_INVOICE_REPOSITORY } from './domain/purchase-invoice.repository.interface';
import { SUPPLIER_PAYMENT_REPOSITORY } from './domain/supplier-payment.repository.interface';
import { PURCHASE_RETURN_REPOSITORY } from './domain/purchase-return.repository.interface';
import { OUTSTANDING_PAYABLE_REPOSITORY } from './domain/outstanding-payable.repository.interface';

import { PurchaseOrderKyselyRepository } from './infrastructure/purchase-order.kysely-repository';
import { GoodsReceivedNoteKyselyRepository } from './infrastructure/goods-received-note.kysely-repository';
import { PurchaseInvoiceKyselyRepository } from './infrastructure/purchase-invoice.kysely-repository';
import { SupplierPaymentKyselyRepository } from './infrastructure/supplier-payment.kysely-repository';
import { PurchaseReturnKyselyRepository } from './infrastructure/purchase-return.kysely-repository';
import { OutstandingPayableKyselyRepository } from './infrastructure/outstanding-payable.kysely-repository';

@Module({
  controllers: [
    PurchaseOrdersController,
    GoodsReceivedNotesController,
    PurchaseInvoicesController,
    SupplierPaymentsController,
    PurchaseReturnsController,
    OutstandingPayablesController,
  ],
  providers: [
    PurchaseOrdersService,
    GoodsReceivedNotesService,
    PurchaseInvoicesService,
    SupplierPaymentsService,
    PurchaseReturnsService,
    OutstandingPayablesService,
    { provide: PURCHASE_ORDER_REPOSITORY, useClass: PurchaseOrderKyselyRepository },
    { provide: GOODS_RECEIVED_NOTE_REPOSITORY, useClass: GoodsReceivedNoteKyselyRepository },
    { provide: PURCHASE_INVOICE_REPOSITORY, useClass: PurchaseInvoiceKyselyRepository },
    { provide: SUPPLIER_PAYMENT_REPOSITORY, useClass: SupplierPaymentKyselyRepository },
    { provide: PURCHASE_RETURN_REPOSITORY, useClass: PurchaseReturnKyselyRepository },
    { provide: OUTSTANDING_PAYABLE_REPOSITORY, useClass: OutstandingPayableKyselyRepository },
  ],
})
export class PurchaseModule {}
