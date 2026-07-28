import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGoodsReceivedNoteProps, GoodsReceivedNote } from '../domain/goods-received-note.entity';
import {
  GOODS_RECEIVED_NOTE_REPOSITORY,
  IGoodsReceivedNoteRepository,
} from '../domain/goods-received-note.repository.interface';
import { DocumentNotDraftError, DocumentNotFoundError } from '../domain/purchase-document.errors';

@Injectable()
export class GoodsReceivedNotesService {
  constructor(
    @Inject(GOODS_RECEIVED_NOTE_REPOSITORY) private readonly grnRepository: IGoodsReceivedNoteRepository,
  ) {}

  list(): Promise<GoodsReceivedNote[]> {
    return this.grnRepository.findAll();
  }

  async getById(id: string): Promise<GoodsReceivedNote> {
    const grn = await this.grnRepository.findById(id);
    if (!grn) throw new NotFoundException(`Goods received note ${id} not found`);
    return grn;
  }

  create(props: CreateGoodsReceivedNoteProps, createdBy?: string): Promise<GoodsReceivedNote> {
    return this.grnRepository.createWithLines(props, createdBy);
  }

  async complete(id: string): Promise<GoodsReceivedNote> {
    try {
      return await this.grnRepository.complete(id);
    } catch (error) {
      if (error instanceof DocumentNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof DocumentNotDraftError) throw new ConflictException(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.grnRepository.delete(id);
    if (!deleted) throw new ConflictException(`Goods received note ${id} not found, or not in draft status`);
  }
}
