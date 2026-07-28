import { InternalServerErrorException } from '@nestjs/common';
import { sql } from 'kysely';
import { Executor } from './stock-posting.helper';

/**
 * Most documents (stock_transfers, stock_adjustments, ...) have no financial_year_id column of
 * their own — the current financial year is looked up fresh on every call, used only
 * transiently for the numbering call, nothing persisted. Purchase Orders/Purchase Invoices
 * (Phase 6) *do* have a financial_year_id column to persist, so they call this directly too.
 */
export async function getCurrentFinancialYearId(executor: Executor): Promise<string> {
  const fy = await executor
    .selectFrom('financial_years')
    .select('id')
    .where('is_current', '=', true)
    .executeTakeFirst();
  if (!fy) {
    throw new InternalServerErrorException('No current financial year configured for this company');
  }
  return fy.id;
}

export async function nextDocumentNumber(executor: Executor, documentType: string, prefix: string): Promise<string> {
  const financialYearId = await getCurrentFinancialYearId(executor);
  const result = await sql<{ document_number: string }>`
    SELECT fn_next_document_number(${documentType}, ${financialYearId}::uuid, ${prefix}) AS document_number
  `.execute(executor);
  return result.rows[0].document_number;
}
