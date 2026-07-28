import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');
export const PRODUCTS_UPLOAD_SUBDIR = 'products';

/**
 * Local-disk file storage (matches the spec's "Local Storage" tech). Multer itself is
 * configured directly in ProductImagesController (NestJS evaluates @UseInterceptors(...)
 * decorator arguments at class-definition time, before DI, so the per-request destination
 * callback can't reach into an injected service — it uses these same UPLOADS_ROOT/
 * PRODUCTS_UPLOAD_SUBDIR constants directly instead). This service owns the read side: the
 * public URL a stored file is served at, and safe deletion by that URL.
 */
@Injectable()
export class LocalFileStorageService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LocalFileStorageService.name);
  }

  publicUrlFor(productId: string, filename: string): string {
    return `/uploads/${PRODUCTS_UPLOAD_SUBDIR}/${productId}/${filename}`;
  }

  /** Best-effort delete — logs and swallows errors (e.g. file already gone) rather than failing the request. */
  async deleteByPublicUrl(publicUrl: string): Promise<void> {
    const prefix = '/uploads/';
    if (!publicUrl.startsWith(prefix)) return;

    const absolutePath = resolve(UPLOADS_ROOT, publicUrl.slice(prefix.length));
    // Defense in depth against path traversal, even though publicUrl always originates from
    // our own publicUrlFor() output, never directly from client input.
    if (!absolutePath.startsWith(UPLOADS_ROOT + '/') && absolutePath !== UPLOADS_ROOT) return;

    try {
      await fs.unlink(absolutePath);
    } catch (err) {
      this.logger.warn({ err, publicUrl }, 'Failed to delete uploaded file (continuing anyway)');
    }
  }
}

export function productUploadDir(productId: string): string {
  return join(UPLOADS_ROOT, PRODUCTS_UPLOAD_SUBDIR, productId);
}
