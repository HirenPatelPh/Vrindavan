import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Optional server-side pagination for `GET /products`. When `page` is omitted, the endpoint
 * keeps returning the full unpaginated array exactly as before — every FK picker across the
 * app (Purchase/Sales/Inventory lines, Product's own barcode-unit picker) reads `/products`
 * this way and must not see a shape change. Pagination only activates when a caller opts in by
 * sending `page`.
 */
export class ListProductsQueryDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
