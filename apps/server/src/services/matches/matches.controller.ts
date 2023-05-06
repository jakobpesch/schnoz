import { Controller, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from 'database';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}
  @Get()
  // TODO: implement pagination
  async findAll(): Promise<Match[]> {
    return this.matchesService.findMany({});
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Match> {
    return this.matchesService.findOne({ id });
  }
}
