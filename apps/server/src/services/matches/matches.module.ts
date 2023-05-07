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
import { MatchesController } from './matches.controller';
import { MapsController } from '../maps/maps.controller';
import { GameSettingsController } from '../game-settings/game-settings.controller';
import { TilesController } from '../tiles/tiles.controller';
import { MatchLogsController } from '../match-logs/match-logs.controller';

@Module({
  controllers: [
    MatchesController,
    MapsController,
    GameSettingsController,
    TilesController,
    MatchLogsController,
  ],
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
