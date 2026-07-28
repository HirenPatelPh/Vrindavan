import '../../core/documents/document_spec.dart';
import 'specs/damaged_stock_spec.dart';
import 'specs/physical_verification_spec.dart';
import 'specs/stock_adjustment_spec.dart';
import 'specs/stock_return_spec.dart';
import 'specs/stock_transfer_spec.dart';

/// The 5 draft→approve document types — drives both the router (one generated `GoRoute` block
/// per spec, see `app_router.dart`) and [InventoryHomeScreen]'s "Documents" group.
final inventoryDocumentSpecs = <DocumentSpec>[
  stockTransferSpec,
  stockAdjustmentSpec,
  physicalVerificationSpec,
  damagedStockSpec,
  stockReturnSpec,
];
