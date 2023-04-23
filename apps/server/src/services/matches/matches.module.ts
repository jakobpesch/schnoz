import { Module } from '@nestjs/common';
import { GameSettingsService } from '../game-settings/game-settings.service';
import { MapsService } from '../maps/maps.service';
import { MatchLogsService } from '../match-logs/match-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { PrismaService } from '../prisma/prisma.service';
import { TilesService } from '../tiles/tiles.service';
import { UsersService } from '../users/users.service';
import { MatchGateway } from './matches.gateway';
import { MatchesService } from './matches.service';

@Module({
  providers: [
    MatchGateway,
    MatchesService,
    PrismaService,
    MapsService,
    ParticipantsService,
    GameSettingsService,
    TilesService,
    UsersService,
    MatchLogsService,
  ],
})
export class MatchesModule {}
