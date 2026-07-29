import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ClsMiddleware, ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { KyselyModule } from './infrastructure/database/kysely/kysely.module';
import { TenantContextModule } from './infrastructure/database/tenant-context/tenant-context.module';
import { TenantContextMiddleware } from './infrastructure/database/tenant-context/tenant-context.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TenantConnectionInterceptor } from './common/interceptors/tenant-connection.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { PaginationInterceptor } from './common/interceptors/pagination.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { HealthModule } from './modules/health/health.module';
import { TenantInfoModule } from './modules/tenant-info/tenant-info.module';
import { UnitsModule } from './modules/units/units.module';
import { AuthModule } from './modules/auth/auth.module';
import { SignupModule } from './modules/signup/signup.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BranchesModule } from './modules/branches/branches.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { RacksModule } from './modules/racks/racks.module';
import { LocationsModule } from './modules/locations/locations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubCategoriesModule } from './modules/sub-categories/sub-categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { GstRatesModule } from './modules/gst-rates/gst-rates.module';
import { HsnCodesModule } from './modules/hsn-codes/hsn-codes.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { TransportersModule } from './modules/transporters/transporters.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AccessModule } from './modules/access/access.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.LOG_LEVEL ?? 'info',
          transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
          autoLogging: { ignore: (req) => req.url === '/health' },
        },
      }),
    }),
    ClsModule.forRoot({ global: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    KyselyModule,
    TenantContextModule,
    HealthModule,
    TenantInfoModule,
    AuthModule,
    SignupModule,
    DashboardModule,
    UnitsModule,
    BranchesModule,
    WarehousesModule,
    RacksModule,
    LocationsModule,
    CategoriesModule,
    SubCategoriesModule,
    BrandsModule,
    GstRatesModule,
    HsnCodesModule,
    TaxesModule,
    SuppliersModule,
    CustomersModule,
    EmployeesModule,
    TransportersModule,
    ProductsModule,
    InventoryModule,
    PurchaseModule,
    SalesModule,
    ReportsModule,
    AccessModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Order matters: JwtAuthGuard (verifies the token, sets request.user + tenant CLS keys)
    // must run before PermissionsGuard (reads request.user.permissions).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantConnectionInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    // Registered AFTER TransformResponse so it runs *inside* it on the response path: it slices a
    // list array into `{ items, total, page, limit }` first (only when `?page=` is present), then
    // the `{ data: ... }` envelope wraps that page object.
    { provide: APP_INTERCEPTOR, useClass: PaginationInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // ClsMiddleware must run first so TenantContextMiddleware has an AsyncLocalStorage
    // context to write into. Both are skipped for /health — it needs neither a tenant nor
    // request-scoped storage.
    consumer
      .apply(ClsMiddleware, TenantContextMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
