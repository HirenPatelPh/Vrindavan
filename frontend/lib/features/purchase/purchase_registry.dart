import '../../core/documents/document_spec.dart';
import 'specs/grn_spec.dart';
import 'specs/purchase_invoice_spec.dart';
import 'specs/purchase_order_spec.dart';
import 'specs/purchase_return_spec.dart';

/// The 4 draft→approve document types in the procure-to-pay cycle that fit [DocumentSpec] —
/// drives both the router (one generated `GoRoute` block per spec) and
/// [PurchaseHomeScreen]'s "Documents" group. Supplier Payment is deliberately not here — it has
/// no status/approve/delete lifecycle at all and gets its own hand-written screens.
final purchaseDocumentSpecs = <DocumentSpec>[
  purchaseOrderSpec,
  grnSpec,
  purchaseInvoiceSpec,
  purchaseReturnSpec,
];
