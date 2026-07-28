import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenPayload } from '../../auth/infrastructure/jwt-token.service';
import { GoodsReceivedNotesService } from '../application/goods-received-notes.service';
import { CreateGoodsReceivedNoteDto } from './dto/create-goods-received-note.dto';
import { GoodsReceivedNoteResponseDto } from './dto/goods-received-note-response.dto';

@ApiTags('purchase')
@Controller('purchase/goods-received-notes')
export class GoodsReceivedNotesController {
  constructor(private readonly grnService: GoodsReceivedNotesService) {}

  @RequirePermissions('goods_received_notes.view')
  @Get()
  async list(): Promise<GoodsReceivedNoteResponseDto[]> {
    const items = await this.grnService.list();
    return items.map((i) => new GoodsReceivedNoteResponseDto(i));
  }

  @RequirePermissions('goods_received_notes.view')
  @Get(':id')
  async getById(@Param('id') id: string): Promise<GoodsReceivedNoteResponseDto> {
    return new GoodsReceivedNoteResponseDto(await this.grnService.getById(id));
  }

  @RequirePermissions('goods_received_notes.create')
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateGoodsReceivedNoteDto,
  ): Promise<GoodsReceivedNoteResponseDto> {
    return new GoodsReceivedNoteResponseDto(await this.grnService.create(dto, user.sub));
  }

  @RequirePermissions('goods_received_notes.approve')
  @Post(':id/complete')
  async complete(@Param('id') id: string): Promise<GoodsReceivedNoteResponseDto> {
    return new GoodsReceivedNoteResponseDto(await this.grnService.complete(id));
  }

  @RequirePermissions('goods_received_notes.delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.grnService.delete(id);
  }
}
