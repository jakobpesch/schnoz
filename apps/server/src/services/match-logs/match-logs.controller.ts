import { Controller, Get, Param } from '@nestjs/common';
import { MatchLogsService } from './match-logs.service';

@Controller('match-logs')
export class MatchLogsController {
  constructor(private readonly matchLogsSerice: MatchLogsService) {}

  @Get(':matchId')
  findByMatchId(@Param('matchId') matchId: string) {
    return this.matchLogsSerice.findMany({ where: { matchId } });
  }
}
