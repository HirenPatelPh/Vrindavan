import { OutstandingPayableFilters, OutstandingPayableRow } from './outstanding-payable.entity';

export const OUTSTANDING_PAYABLE_REPOSITORY = Symbol('OUTSTANDING_PAYABLE_REPOSITORY');

export interface IOutstandingPayableRepository {
  findAll(filters: OutstandingPayableFilters): Promise<OutstandingPayableRow[]>;
}
