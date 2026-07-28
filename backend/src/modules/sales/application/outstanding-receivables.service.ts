import { Inject, Injectable } from '@nestjs/common';
import { OutstandingReceivableFilters, OutstandingReceivableRow } from '../domain/outstanding-receivable.entity';
import {
  IOutstandingReceivableRepository,
  OUTSTANDING_RECEIVABLE_REPOSITORY,
} from '../domain/outstanding-receivable.repository.interface';

@Injectable()
export class OutstandingReceivablesService {
  constructor(
    @Inject(OUTSTANDING_RECEIVABLE_REPOSITORY)
    private readonly outstandingReceivableRepository: IOutstandingReceivableRepository,
  ) {}

  list(filters: OutstandingReceivableFilters): Promise<OutstandingReceivableRow[]> {
    return this.outstandingReceivableRepository.findAll(filters);
  }
}
