import 'package:flutter/material.dart';
import '../../core/crud/entity_spec.dart';
import 'specs/brand_spec.dart';
import 'specs/branch_spec.dart';
import 'specs/category_spec.dart';
import 'specs/customer_spec.dart';
import 'specs/employee_spec.dart';
import 'specs/gst_rate_spec.dart';
import 'specs/hsn_code_spec.dart';
import 'specs/location_spec.dart';
import 'specs/rack_spec.dart';
import 'specs/sub_category_spec.dart';
import 'specs/supplier_spec.dart';
import 'specs/tax_spec.dart';
import 'specs/transporter_spec.dart';
import 'specs/unit_spec.dart';
import 'specs/warehouse_spec.dart';

/// One group of related modules for navigation display — purely a UI grouping, the backend has
/// no notion of it.
class MasterDataGroup {
  const MasterDataGroup({required this.title, required this.icon, required this.specs});

  final String title;
  final IconData icon;
  final List<EntitySpec> specs;
}

final masterDataGroups = <MasterDataGroup>[
  MasterDataGroup(
    title: 'Organization',
    icon: Icons.account_tree_outlined,
    specs: [branchSpec, warehouseSpec, rackSpec, locationSpec],
  ),
  MasterDataGroup(
    title: 'Catalog',
    icon: Icons.category_outlined,
    specs: [categorySpec, subCategorySpec, brandSpec, unitSpec],
  ),
  MasterDataGroup(title: 'Tax', icon: Icons.receipt_long_outlined, specs: [gstRateSpec, hsnCodeSpec, taxSpec]),
  MasterDataGroup(
    title: 'Parties',
    icon: Icons.people_outline,
    specs: [supplierSpec, customerSpec, employeeSpec, transporterSpec],
  ),
];

/// All 15 EntitySpecs keyed by resource path, for the generic list/form routes to look up by
/// the `:module` path parameter.
final masterDataRegistry = <String, EntitySpec>{
  for (final group in masterDataGroups) for (final spec in group.specs) spec.resourcePath: spec,
};
