import { Module } from "@nestjs/common"
import { GameSettingsController } from "../game-settings/game-settings.controller"
import { GameSettingsService } from "../game-settings/game-settings.service"
import { MapsController } from "../maps/maps.controller"
import { MapsService } from "../maps/maps.service"
import { MatchLogsController } from "../match-logs/match-logs.controller"
import { MatchLogsService } from "../match-logs/match-logs.service"
import { ParticipantsService } from "../participants/participants.service"
import { PrismaService } from "../prisma/prisma.service"
import { TilesController } from "../tiles/tiles.controller"
import { TilesService } from "../tiles/tiles.service"
import { MatchesController } from "./matches.controller"
import { MatchGateway } from "./matches.gateway"
import { MatchesService } from "./matches.service"
import { UsersService } from "../users/users.service"

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
