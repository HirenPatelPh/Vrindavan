import { Inject, Injectable } from '@nestjs/common';
import { OutstandingPayableFilters, OutstandingPayableRow } from '../domain/outstanding-payable.entity';
import {
  IOutstandingPayableRepository,
  OUTSTANDING_PAYABLE_REPOSITORY,
} from '../domain/outstanding-payable.repository.interface';

@Injectable()
export class OutstandingPayablesService {
  constructor(
    @Inject(OUTSTANDING_PAYABLE_REPOSITORY) private readonly outstandingPayableRepository: IOutstandingPayableRepository,
  ) {}

  list(filters: OutstandingPayableFilters): Promise<OutstandingPayableRow[]> {
    return this.outstandingPayableRepository.findAll(filters);
  }
}
