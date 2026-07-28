import 'package:dio/dio.dart' show FormData, MultipartFile;
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/config/app_config.dart';
import '../../../core/crud/application/generic_crud_providers.dart';
import '../../../core/providers/core_providers.dart';

/// Only sub-resource that isn't JSON CRUD: upload is `multipart/form-data` (field name `file`,
/// matching `upload-product-image.dto.ts`), and there's a one-off `.../:id/primary` toggle
/// instead of a general update endpoint — both called directly via [ApiClient] rather than
/// [GenericCrudApi], which only knows how to send JSON bodies.
class ProductImagesTab extends ConsumerStatefulWidget {
  const ProductImagesTab({required this.productId, super.key});

  final String productId;

  @override
  ConsumerState<ProductImagesTab> createState() => _ProductImagesTabState();
}

class _ProductImagesTabState extends ConsumerState<ProductImagesTab> {
  bool _uploading = false;

  String get _resourcePath => 'products/${widget.productId}/images';

  Future<void> _upload() async {
    final result = await FilePicker.pickFiles(type: FileType.image, withData: true);
    final file = result?.files.single;
    if (file == null || file.bytes == null) return;

    setState(() => _uploading = true);
    try {
      final formData = FormData.fromMap({'file': MultipartFile.fromBytes(file.bytes!, filename: file.name)});
      await ref.read(apiClientProvider).postFormData('/$_resourcePath', formData: formData);
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _setPrimary(String imageId) async {
    try {
      await ref.read(apiClientProvider).patch('/$_resourcePath/$imageId/primary');
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _delete(String imageId) async {
    try {
      await ref.read(genericCrudApiProvider(_resourcePath)).delete(imageId);
      ref.invalidate(entityListProvider(_resourcePath));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final imagesAsync = ref.watch(entityListProvider(_resourcePath));

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _uploading ? null : _upload,
        icon: _uploading
            ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
            : const Icon(Icons.upload_outlined),
        label: Text(_uploading ? 'Uploading…' : 'Upload'),
      ),
      body: imagesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load images: $e')),
        data: (images) {
          if (images.isEmpty) return const Center(child: Text('No images yet.'));
          return GridView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 180,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
            ),
            itemCount: images.length,
            itemBuilder: (context, index) {
              final image = images[index];
              final isPrimary = image['isPrimary'] as bool? ?? false;
              return Card(
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      '${AppConfig.mediaOrigin}${image['imageUrl']}',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(child: Icon(Icons.broken_image_outlined)),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: IconButton.filled(
                        icon: const Icon(Icons.delete_outline, size: 18),
                        tooltip: 'Delete',
                        onPressed: () => _delete(image['id'] as String),
                      ),
                    ),
                    Positioned(
                      bottom: 4,
                      left: 4,
                      child: IconButton.filled(
                        icon: Icon(isPrimary ? Icons.star : Icons.star_border, size: 18),
                        tooltip: isPrimary ? 'Primary image' : 'Set as primary',
                        onPressed: isPrimary ? null : () => _setPrimary(image['id'] as String),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
