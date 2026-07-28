import { Module } from '@nestjs/common';

import { ProductsController } from './presentation/products.controller';
import { ProductImagesController } from './presentation/product-images.controller';
import { ProductUnitsController } from './presentation/product-units.controller';
import { ProductBatchesController } from './presentation/product-batches.controller';
import { ProductBarcodesController } from './presentation/product-barcodes.controller';
import { ProductPriceHistoryController } from './presentation/product-price-history.controller';

import { ProductsService } from './application/products.service';
import { ProductImagesService } from './application/product-images.service';
import { ProductUnitsService } from './application/product-units.service';
import { ProductBatchesService } from './application/product-batches.service';
import { ProductBarcodesService } from './application/product-barcodes.service';
import { ProductPriceHistoryService } from './application/product-price-history.service';

import { PRODUCT_REPOSITORY } from './domain/product.repository.interface';
import { PRODUCT_IMAGE_REPOSITORY } from './domain/product-image.repository.interface';
import { PRODUCT_UNIT_REPOSITORY } from './domain/product-unit.repository.interface';
import { PRODUCT_BATCH_REPOSITORY } from './domain/product-batch.repository.interface';
import { PRODUCT_BARCODE_REPOSITORY } from './domain/product-barcode.repository.interface';
import { PRODUCT_PRICE_HISTORY_REPOSITORY } from './domain/product-price-history.repository.interface';

import { ProductKyselyRepository } from './infrastructure/product.kysely-repository';
import { ProductImageKyselyRepository } from './infrastructure/product-image.kysely-repository';
import { ProductUnitKyselyRepository } from './infrastructure/product-unit.kysely-repository';
import { ProductBatchKyselyRepository } from './infrastructure/product-batch.kysely-repository';
import { ProductBarcodeKyselyRepository } from './infrastructure/product-barcode.kysely-repository';
import { ProductPriceHistoryKyselyRepository } from './infrastructure/product-price-history.kysely-repository';
import { LocalFileStorageService } from './infrastructure/local-file-storage.service';

@Module({
  controllers: [
    ProductsController,
    ProductImagesController,
    ProductUnitsController,
    ProductBatchesController,
    ProductBarcodesController,
    ProductPriceHistoryController,
  ],
  providers: [
    ProductsService,
    ProductImagesService,
    ProductUnitsService,
    ProductBatchesService,
    ProductBarcodesService,
    ProductPriceHistoryService,
    LocalFileStorageService,
    { provide: PRODUCT_REPOSITORY, useClass: ProductKyselyRepository },
    { provide: PRODUCT_IMAGE_REPOSITORY, useClass: ProductImageKyselyRepository },
    { provide: PRODUCT_UNIT_REPOSITORY, useClass: ProductUnitKyselyRepository },
    { provide: PRODUCT_BATCH_REPOSITORY, useClass: ProductBatchKyselyRepository },
    { provide: PRODUCT_BARCODE_REPOSITORY, useClass: ProductBarcodeKyselyRepository },
    { provide: PRODUCT_PRICE_HISTORY_REPOSITORY, useClass: ProductPriceHistoryKyselyRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
