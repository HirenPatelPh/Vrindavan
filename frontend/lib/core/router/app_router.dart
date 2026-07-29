import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../features/auth/application/auth_provider.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/inventory/inventory_registry.dart';
import '../../features/inventory/presentation/blocked_stock_form_screen.dart';
import '../../features/inventory/presentation/blocked_stock_list_screen.dart';
import '../../features/inventory/presentation/inventory_home_screen.dart';
import '../../features/inventory/presentation/reserved_stock_form_screen.dart';
import '../../features/inventory/presentation/reserved_stock_list_screen.dart';
import '../../features/inventory/presentation/stock_balances_screen.dart';
import '../../features/inventory/presentation/stock_ledger_screen.dart';
import '../../features/master_data/master_data_registry.dart';
import '../../features/master_data/presentation/master_data_home_screen.dart';
import '../../features/products/presentation/product_detail_screen.dart';
import '../../features/products/specs/product_spec.dart';
import '../../features/purchase/presentation/outstanding_payables_screen.dart';
import '../../features/purchase/presentation/purchase_home_screen.dart';
import '../../features/purchase/presentation/supplier_payment_detail_screen.dart';
import '../../features/purchase/presentation/supplier_payment_form_screen.dart';
import '../../features/purchase/presentation/supplier_payment_list_screen.dart';
import '../../features/purchase/purchase_registry.dart';
import '../../features/reports/presentation/reports_home_screen.dart';
import '../../features/reports/reports_registry.dart';
import '../../features/access/presentation/access_home_screen.dart';
import '../../features/audit/presentation/audit_log_screen.dart';
import '../../features/access/presentation/users_screen.dart';
import '../../features/access/presentation/roles_permissions_screen.dart';
import '../../features/sales/presentation/customer_payment_detail_screen.dart';
import '../../features/sales/presentation/customer_payment_form_screen.dart';
import '../../features/sales/presentation/customer_payment_list_screen.dart';
import '../../features/sales/presentation/outstanding_receivables_screen.dart';
import '../../features/sales/presentation/quotation_detail_screen.dart';
import '../../features/sales/presentation/sales_home_screen.dart';
import '../../features/sales/sales_registry.dart';
import '../../features/sales/specs/quotation_spec.dart';
import '../crud/presentation/generic_form_screen.dart';
import '../crud/presentation/generic_list_screen.dart';
import '../documents/presentation/document_detail_screen.dart';
import '../documents/presentation/document_form_screen.dart';
import '../documents/presentation/document_list_screen.dart';
import '../reports/presentation/report_screen.dart';
import 'app_shell.dart';

part 'app_router.g.dart';

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: CircularProgressIndicator()));
}

class _UnknownModuleScreen extends StatelessWidget {
  const _UnknownModuleScreen();

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Unknown module.')));
}

/// Notifies go_router to re-run [redirect] whenever [authProvider]'s state changes — without
/// this, a login/logout wouldn't trigger navigation until some unrelated route change.
class _AuthRefreshListenable extends ChangeNotifier {
  _AuthRefreshListenable(Ref ref) {
    ref.listen(authProvider, (_, _) => notifyListeners());
  }
}

@Riverpod(keepAlive: true)
GoRouter appRouter(Ref ref) {
  final refreshListenable = _AuthRefreshListenable(ref);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: refreshListenable,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isResolving = authState.isLoading && !authState.hasValue;
      final isLoggedIn = authState.value != null;
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/signup';
      final isSplash = state.matchedLocation == '/';

      if (isResolving) return isSplash ? null : '/';
      if (!isLoggedIn) return isAuthRoute ? null : '/login';
      if (isAuthRoute || isSplash) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const _SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (context, state) => const SignupScreen()),
      ShellRoute(
        builder: (context, state, child) => AppShell(currentLocation: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
          GoRoute(
            path: '/master',
            builder: (context, state) => const MasterDataHomeScreen(),
            routes: [
              GoRoute(
                path: ':module',
                builder: (context, state) {
                  final spec = masterDataRegistry[state.pathParameters['module']];
                  return spec == null ? const _UnknownModuleScreen() : GenericListScreen(spec: spec);
                },
                routes: [
                  GoRoute(
                    path: 'new',
                    builder: (context, state) {
                      final spec = masterDataRegistry[state.pathParameters['module']];
                      return spec == null ? const _UnknownModuleScreen() : GenericFormScreen(spec: spec);
                    },
                  ),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final spec = masterDataRegistry[state.pathParameters['module']];
                      if (spec == null) return const _UnknownModuleScreen();
                      return GenericFormScreen(
                        spec: spec,
                        recordId: state.pathParameters['id'],
                        initialData: state.extra as Map<String, dynamic>?,
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/products',
            builder: (context, state) => GenericListScreen(spec: productSpec),
            routes: [
              GoRoute(path: 'new', builder: (context, state) => GenericFormScreen(spec: productSpec)),
              GoRoute(
                path: ':id',
                builder: (context, state) => ProductDetailScreen(
                  productId: state.pathParameters['id']!,
                  initialData: state.extra as Map<String, dynamic>?,
                ),
                routes: [
                  GoRoute(
                    path: 'edit',
                    builder: (context, state) => GenericFormScreen(
                      spec: productSpec,
                      recordId: state.pathParameters['id'],
                      initialData: state.extra as Map<String, dynamic>?,
                    ),
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/inventory',
            builder: (context, state) => const InventoryHomeScreen(),
            routes: [
              for (final spec in inventoryDocumentSpecs)
                GoRoute(
                  path: spec.resourcePath.substring('inventory/'.length),
                  builder: (context, state) => DocumentListScreen(spec: spec),
                  routes: [
                    GoRoute(path: 'new', builder: (context, state) => DocumentFormScreen(spec: spec)),
                    GoRoute(
                      path: ':id',
                      builder: (context, state) => DocumentDetailScreen(spec: spec, documentId: state.pathParameters['id']!),
                    ),
                  ],
                ),
              GoRoute(
                path: 'blocked-stock',
                builder: (context, state) => const BlockedStockListScreen(),
                routes: [GoRoute(path: 'new', builder: (context, state) => const BlockedStockFormScreen())],
              ),
              GoRoute(
                path: 'reserved-stock',
                builder: (context, state) => const ReservedStockListScreen(),
                routes: [GoRoute(path: 'new', builder: (context, state) => const ReservedStockFormScreen())],
              ),
              GoRoute(path: 'stock-balances', builder: (context, state) => const StockBalancesScreen()),
              GoRoute(path: 'stock-ledger', builder: (context, state) => const StockLedgerScreen()),
            ],
          ),
          GoRoute(
            path: '/purchase',
            builder: (context, state) => const PurchaseHomeScreen(),
            routes: [
              for (final spec in purchaseDocumentSpecs)
                GoRoute(
                  path: spec.resourcePath.substring('purchase/'.length),
                  builder: (context, state) => DocumentListScreen(spec: spec),
                  routes: [
                    GoRoute(path: 'new', builder: (context, state) => DocumentFormScreen(spec: spec)),
                    GoRoute(
                      path: ':id',
                      builder: (context, state) => DocumentDetailScreen(spec: spec, documentId: state.pathParameters['id']!),
                    ),
                  ],
                ),
              GoRoute(
                path: supplierPaymentResourcePath.substring('purchase/'.length),
                builder: (context, state) => const SupplierPaymentListScreen(),
                routes: [
                  GoRoute(path: 'new', builder: (context, state) => const SupplierPaymentFormScreen()),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => SupplierPaymentDetailScreen(paymentId: state.pathParameters['id']!),
                  ),
                ],
              ),
              GoRoute(path: 'outstanding-payables', builder: (context, state) => const OutstandingPayablesScreen()),
            ],
          ),
          GoRoute(
            path: '/sales',
            builder: (context, state) => const SalesHomeScreen(),
            routes: [
              GoRoute(
                path: quotationSpec.resourcePath.substring('sales/'.length),
                builder: (context, state) => DocumentListScreen(spec: quotationSpec),
                routes: [
                  GoRoute(path: 'new', builder: (context, state) => DocumentFormScreen(spec: quotationSpec)),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => QuotationDetailScreen(quotationId: state.pathParameters['id']!),
                  ),
                ],
              ),
              for (final spec in salesDocumentSpecs)
                GoRoute(
                  path: spec.resourcePath.substring('sales/'.length),
                  builder: (context, state) => DocumentListScreen(spec: spec),
                  routes: [
                    GoRoute(path: 'new', builder: (context, state) => DocumentFormScreen(spec: spec)),
                    GoRoute(
                      path: ':id',
                      builder: (context, state) => DocumentDetailScreen(spec: spec, documentId: state.pathParameters['id']!),
                    ),
                  ],
                ),
              GoRoute(
                path: customerPaymentResourcePath.substring('sales/'.length),
                builder: (context, state) => const CustomerPaymentListScreen(),
                routes: [
                  GoRoute(path: 'new', builder: (context, state) => const CustomerPaymentFormScreen()),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => CustomerPaymentDetailScreen(paymentId: state.pathParameters['id']!),
                  ),
                ],
              ),
              GoRoute(path: 'outstanding-receivables', builder: (context, state) => const OutstandingReceivablesScreen()),
            ],
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsHomeScreen(),
            routes: [
              for (final spec in reportSpecs)
                GoRoute(
                  path: spec.resourcePath.substring('reports/'.length),
                  builder: (context, state) => ReportScreen(spec: spec),
                ),
            ],
          ),
          GoRoute(
            path: '/access',
            builder: (context, state) => const AccessHomeScreen(),
            routes: [
              GoRoute(path: 'users', builder: (context, state) => const UsersScreen()),
              GoRoute(path: 'roles', builder: (context, state) => const RolesPermissionsScreen()),
            ],
          ),
          GoRoute(path: '/audit', builder: (context, state) => const AuditLogScreen()),
        ],
      ),
    ],
  );
}
