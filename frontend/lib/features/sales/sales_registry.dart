import '../../core/documents/document_spec.dart';
import 'specs/delivery_challan_spec.dart';
import 'specs/sales_invoice_spec.dart';
import 'specs/sales_order_spec.dart';
import 'specs/sales_return_spec.dart';

/// The 4 draft→approve document types that fit [DocumentSpec] end-to-end (list, create, AND
/// detail). Quotation is deliberately not here — it reuses [DocumentSpec] for list/create only;
/// its `:id` route goes to a hand-written `QuotationDetailScreen`, so it's wired separately in
/// the router rather than through this generated-loop registry.
final salesDocumentSpecs = <DocumentSpec>[
  salesOrderSpec,
  deliveryChallanSpec,
  salesInvoiceSpec,
  salesReturnSpec,
];
