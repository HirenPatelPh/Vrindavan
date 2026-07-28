import { OutstandingReceivableFilters, OutstandingReceivableRow } from './outstanding-receivable.entity';

export const OUTSTANDING_RECEIVABLE_REPOSITORY = Symbol('OUTSTANDING_RECEIVABLE_REPOSITORY');

export interface IOutstandingReceivableRepository {
  findAll(filters: OutstandingReceivableFilters): Promise<OutstandingReceivableRow[]>;
}
