import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListAuditLogsDto {
  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsUUID()
  recordId?: string;

  @IsOptional()
  @IsIn(['insert', 'update', 'delete'])
  action?: 'insert' | 'update' | 'delete';

  @IsOptional()
  @IsUUID()
  changedBy?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
