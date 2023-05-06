import { Controller, Get, Param } from '@nestjs/common';
import { TilesService } from './tiles.service';
import { TileWithUnit } from 'types';

@Controller('tiles')
export class TilesController {
  constructor(private readonly tilesService: TilesService) {}

  @Get(':mapId')
  // TODO: implement pagination
  async findByMap(@Param('mapId') mapId: string): Promise<TileWithUnit[]> {
    return this.tilesService.findMany({ where: { mapId } });
  }

  @Get(':id/:row/:col')
  async findOne(
    @Param() params: { mapId: string; row: number; col: number },
  ): Promise<TileWithUnit> {
    const { mapId, row, col } = params;
    return this.tilesService.findOne({
      mapId_row_col: {
        mapId,
        row,
        col,
      },
    });
  }
}
