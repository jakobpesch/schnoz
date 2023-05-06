import { Controller, Get, Param } from '@nestjs/common';
import { GameSettingsService } from './game-settings.service';

@Controller('game-settings')
export class GameSettingsController {
  constructor(private readonly gameSettings: GameSettingsService) {}

  @Get()
  async findAll() {
    return this.gameSettings.findMany({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.gameSettings.findOne({ id });
  }
}
