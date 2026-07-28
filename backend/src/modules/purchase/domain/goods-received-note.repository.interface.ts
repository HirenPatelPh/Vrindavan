import { CreateGoodsReceivedNoteProps, GoodsReceivedNote } from './goods-received-note.entity';

export const GOODS_RECEIVED_NOTE_REPOSITORY = Symbol('GOODS_RECEIVED_NOTE_REPOSITORY');

export interface IGoodsReceivedNoteRepository {
  findAll(): Promise<GoodsReceivedNote[]>;
  findById(id: string): Promise<GoodsReceivedNote | null>;
  createWithLines(props: CreateGoodsReceivedNoteProps, createdBy?: string): Promise<GoodsReceivedNote>;
  /**
   * draft -> completed. Posts purchase_in per line (unit-converted to base units), rolls up
   * the linked PO line's received_quantity and the PO's own status. Throws
   * DocumentNotFoundError/DocumentNotDraftError.
   */
  complete(id: string): Promise<GoodsReceivedNote>;
  delete(id: string): Promise<boolean>;
}
