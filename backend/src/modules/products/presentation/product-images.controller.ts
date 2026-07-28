import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { extname } from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ProductImagesService } from '../application/product-images.service';
import { productUploadDir } from '../infrastructure/local-file-storage.service';
import { UploadProductImageDto } from './dto/upload-product-image.dto';
import { ProductImageResponseDto } from './dto/product-image-response.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('products')
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @RequirePermissions('products.view')
  @Get()
  async list(@Param('productId') productId: string): Promise<ProductImageResponseDto[]> {
    const items = await this.productImagesService.list(productId);
    return items.map((i) => new ProductImageResponseDto(i));
  }

  @RequirePermissions('products.edit')
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const { productId } = req.params as { productId: string };
          const dir = productUploadDir(productId);
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(new BadRequestException('Only JPEG, PNG, WEBP, or GIF images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadProductImageDto,
  ): Promise<ProductImageResponseDto> {
    if (!file) throw new BadRequestException('No file uploaded (expected multipart field "file")');
    const image = await this.productImagesService.upload(productId, file.filename, dto.isPrimary ?? false);
    return new ProductImageResponseDto(image);
  }

  @RequirePermissions('products.edit')
  @Patch(':imageId/primary')
  async setPrimary(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<ProductImageResponseDto> {
    return new ProductImageResponseDto(await this.productImagesService.setPrimary(productId, imageId));
  }

  @RequirePermissions('products.edit')
  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('productId') productId: string, @Param('imageId') imageId: string): Promise<void> {
    await this.productImagesService.remove(productId, imageId);
  }
}
