import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  GameSettings,
  Map as SchnozMap,
  Match,
  MatchStatus,
  Participant,
  Tile,
  Unit,
  UnitConstellation,
  UnitType,
  User,
} from 'database';
import { Socket } from 'socket.io';
import { determineWinner } from 'src/gameLogic/determineWinner';
import { createCustomGame } from 'src/gameLogic/GameVariants';
import { isLastTurn } from 'src/gameLogic/isLastTurn';
import { checkConditionsForUnitConstellationPlacement } from 'src/gameLogic/PlacementRule';
import { Coordinate } from 'src/shared/types/coordinate.type';
import { ParticipantWithUser } from 'src/shared/types/database/participant-with-user.type';
import { TileWithUnit } from 'src/shared/types/database/tile-with-units.type';
import { Error } from 'src/shared/types/error.interface';
import { MatchInstanceEvent } from 'src/shared/types/events/match-instance-event.enum';
import { PlacementRuleName } from 'src/shared/types/placementRule/placement-rule-name.type';
import { Special } from 'src/shared/types/special/special.interface';
import { IUnitConstellation } from 'src/shared/types/unit-constellation.interface';
import { shuffleArray } from 'src/utils/arrayUtils';
import {
  buildTileLookupId,
  getNewlyRevealedTiles,
  getTileLookup,
} from 'src/utils/coordinateUtils';
import { GameSettingsService } from '../game-settings/game-settings.service';
import { MapsService } from '../maps/maps.service';
import { MatchLogsService } from '../match-logs/match-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { TilesService } from '../tiles/tiles.service';
import { UsersService } from '../users/users.service';
import { MatchesService } from './matches.service';

export class MatchInstance {
  private match: Match;
  get Match() {
    return this.match;
  }
  private participants: ParticipantWithUser[] = [];
  get Participants() {
    return this.participants;
  }
  private users: User[] = [];
  get Users() {
    return this.users;
  }
  private map: SchnozMap | null = null;
  get Map() {
    return this.map;
  }
  private tilesWithUnits: TileWithUnit[] | null = null;
  get TilesWithUnits() {
    return this.tilesWithUnits;
  }
  private gameSettings: GameSettings | null = null;
  get GameSettings() {
    return this.gameSettings;
  }

  get activePlayer() {
    return this.participants.find(
      (player) => player.id === this.match.activePlayerId,
    );
  }

  public sockets = new Map<User['id'], Socket>();
  private endTurnTime = 0;
  private readonly turnTime = 30_000;
  private turnTimer: NodeJS.Timeout | undefined;

  constructor(
    public readonly Id: Match['id'],
    private readonly eventEmitter: EventEmitter2,
    private readonly matchesService: MatchesService,
    private readonly gameSettingsService: GameSettingsService,
    private readonly mapsService: MapsService,
    private readonly participantsService: ParticipantsService,
    private readonly matchLogService: MatchLogsService,
    private readonly tilesService: TilesService,
    private readonly usersService: UsersService,
  ) {}

  public async init() {
    await this.sync();
  }

  public getOpponentByUserId(userId: User['id']) {
    return this.participants.find((player) => player.userId !== userId);
  }

  private async sync() {
    this.match = await this.matchesService.findOne({ id: this.Id });
    this.gameSettings = await this.gameSettingsService.findOne({
      matchId: this.Id,
    });
    const participants = await this.participantsService.findMany({
      where: { matchId: this.Id },
      orderBy: { playerNumber: 'asc' },
    });
    if (participants.length === 0) {
      throw new Error(`No player in match with id ${this.Id}`);
    }
    this.participants = participants;

    this.map = await this.mapsService.findOne({ matchId: this.Id });
    if (this.map) {
      this.tilesWithUnits = await this.tilesService.findMany({
        where: { mapId: this.map.id },
      });
    }
  }

  /** Participant connects to match instance */
  public async connect(socket: Socket, userId: User['id']) {
    await this.sync();

    if (!this.participants) {
      throw new Error(
        `User with id ${userId} is no participant in match ${this.Id}`,
      );
    }
    const userIsParticipant = this.participants.some(
      (player) => player.userId === userId,
    );
    if (!userIsParticipant) {
      throw new Error(
        `User with id ${userId} is no participant in match ${this.Id}`,
      );
    }
    const existingSocket = this.sockets.get(userId);
    if (existingSocket) {
      existingSocket.disconnect();
    }
    socket.join(this.Id);
    this.sockets.set(userId, socket);
    // console.log(this.sockets.keys());
    // if (this.sockets.size === 2) {
    //   this.nextTurn();
    // }
  }

  public async kickParticipant(participantId: Participant['id']) {
    if (this.match.status !== MatchStatus.CREATED) {
      throw new Error('Cannot kick participants in a running match.');
    }
    await this.participantsService.delete({ id: participantId });
    this.participants = this.participants.filter(
      (player) => player.id !== participantId,
    );
    await this.matchLogService.create({
      matchId: this.Id,
      message: `Player ${participantId} was kicked from the match.`,
    });
  }

  private nextTurn() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
    }
    this.endTurnTime = Date.now() + this.turnTime;
    this.eventEmitter.emit(
      MatchInstanceEvent.START_TURN,
      this.match.activePlayerId,
      this.endTurnTime,
    );
    this.turnTimer = setTimeout(() => {
      this.nextTurn();
    }, this.turnTime);
  }

  public disconnect(socket: Socket, userId: User['id']) {
    socket.leave(this.Id);
    this.sockets.delete(userId);
  }

  public async setGameSettings(
    settings: Omit<Partial<GameSettings>, 'id' | 'matchId'>,
  ) {
    this.gameSettings = await this.gameSettingsService.update({
      where: { matchId: this.Id },
      data: settings,
    });
    return this.gameSettings;
  }

  private checkConditionsForCreation(userId: string): { error?: Error } {
    if (this.match.status === MatchStatus.STARTED) {
      return {
        error: { message: 'Match has already started', statusCode: 400 },
      };
    }
    if (this.match.createdById !== userId) {
      return {
        error: {
          message: "Only the match's creator can start the match",
          statusCode: 400,
        },
      };
    }
    if (!this.map) {
      return { error: { message: 'No map', statusCode: 500 } };
    }
    if (!this.participants) {
      return { error: { message: 'Players array is null', statusCode: 500 } };
    }
    if (this.participants.length < 2) {
      return { error: { message: 'Match is not full yet', statusCode: 400 } };
    }
    if (!this.gameSettings) {
      return { error: { message: 'No game settings', statusCode: 500 } };
    }

    const isMapSizeEven = this.gameSettings.mapSize % 2 === 0;
    if (isMapSizeEven) {
      return {
        error: {
          message: 'mapSize needs to be an odd integer',
          statusCode: 400,
        },
      };
    }

    return {};
  }

  public async startMatch(userId: User['id']) {
    await this.sync();
    const { error: startError } = this.checkConditionsForCreation(userId);

    if (startError) {
      return startError;
    }

    const status = MatchStatus.STARTED;
    const startedAt = new Date();

    const activePlayerId = this.participants!.find(
      (player) => player.userId === userId,
    )?.id;

    const openCards = shuffleArray<UnitConstellation>(
      Object.values({ ...UnitConstellation }),
    ).slice(0, 3);

    const turn = 1;

    this.match = await this.matchesService.update({
      where: { id: this.match.id },
      data: {
        openCards,
        status,
        startedAt,
        activePlayerId,
        turn,
        logs: {
          createMany: {
            data: [
              { message: `Match started by ${userId}` },
              {
                message: `Game settings`,
                data: JSON.stringify(this.gameSettings),
              },
            ],
          },
        },
      },
    });

    return this.match;
  }

  public async makeMove(
    participantId: Participant['id'],
    targetRow: Coordinate[0],
    targetCol: Coordinate[1],
    ignoredRules: PlacementRuleName[],
    unitConstellation: IUnitConstellation,
    specials: Special[],
  ): Promise<
    | {
        updatedMatch: Match;
        updatedTilesWithUnits: TileWithUnit[];
        updatedPlayers: ParticipantWithUser[];
      }
    | Error
  > {
    await this.sync();

    if (!this.map) {
      return { message: 'Map is missing', statusCode: 500 };
    }

    if (!this.activePlayer) {
      return { message: 'Active player is not set', statusCode: 500 };
    }

    if (!this.tilesWithUnits) {
      return { message: 'No tiles', statusCode: 500 };
    }

    if (!this.gameSettings) {
      return { message: 'No game settings', statusCode: 500 };
    }

    const currentBonusPoints =
      this.activePlayer.bonusPoints + unitConstellation.value;

    const canAffordSpecials =
      currentBonusPoints >=
      specials.reduce((totalCost, special) => {
        return totalCost + special.cost;
      }, 0);

    if (!canAffordSpecials) {
      return {
        message: 'Not enough bonus points for specials',
        statusCode: 400,
      };
    }

    const tileLookup = getTileLookup(this.tilesWithUnits);
    const { translatedCoordinates, error } =
      checkConditionsForUnitConstellationPlacement(
        [targetRow, targetCol],
        unitConstellation,
        this.match,
        this.activePlayer,
        this.map,
        this.tilesWithUnits,
        tileLookup,
        ignoredRules,
        participantId,
        specials,
      );

    if (error) {
      return error;
    }

    const { tiles: revealedTiles, error: revealedError } =
      getNewlyRevealedTiles(tileLookup, translatedCoordinates);

    if (revealedError) {
      return revealedError;
    }

    const updateTilesPromises: Promise<Tile & { unit: Unit | null }>[] = [];
    translatedCoordinates.forEach((coordinate) => {
      const { mapId, row, col } = tileLookup[buildTileLookupId(coordinate)];
      updateTilesPromises.push(
        this.tilesService.update({
          where: { mapId_row_col: { mapId, row, col } },
          data: {
            unit: { create: { type: UnitType.UNIT, ownerId: participantId } },
          },
        }),
      );
    });
    revealedTiles.forEach(({ mapId, row, col }) => {
      updateTilesPromises.push(
        this.tilesService.update({
          where: {
            mapId_row_col: { mapId, row, col },
          },
          data: {
            visible: true,
          },
        }),
      );
    });
    const updatedTilesWithUnits = await Promise.all(updateTilesPromises);
    const matchWithPlacedTiles = await this.matchesService.findOneRich({
      id: this.match.id,
    });

    if (
      !matchWithPlacedTiles ||
      !matchWithPlacedTiles.activePlayer ||
      !matchWithPlacedTiles.map
    ) {
      return { message: 'Match could not be fetched', statusCode: 500 };
    }

    if (!this.activePlayer) {
      return { message: 'Error while placing', statusCode: 500 };
    }
    const gameType = createCustomGame(this.gameSettings?.rules ?? null);
    const playersWithUpdatedScore = gameType.evaluate(matchWithPlacedTiles);

    const updatedPlayers: ParticipantWithUser[] = [];
    for (let i = 0; i < playersWithUpdatedScore.length; i++) {
      const player = playersWithUpdatedScore[i];

      const bonusPointsFromCard = unitConstellation.value;

      const usedPointsFromSpecials = specials.reduce((totalCost, special) => {
        return totalCost + special.cost;
      }, 0);

      updatedPlayers.push(
        await this.participantsService.update({
          where: { id: player.id },
          data: {
            score: player.score,
            ...(player.id === this.activePlayer.id
              ? {
                  bonusPoints:
                    this.activePlayer.bonusPoints +
                    bonusPointsFromCard -
                    usedPointsFromSpecials,
                }
              : {}),
          },
        }),
      );
    }
    this.participants = updatedPlayers;

    const winnerId =
      determineWinner(this.match, this.gameSettings, playersWithUpdatedScore)
        ?.id ?? null;

    const shouldChangeActivePlayer = gameType.shouldChangeActivePlayer(
      this.match.turn,
    );

    const shouldChangeCards = gameType.shouldChangeCards(this.match.turn);

    const openCards = shouldChangeCards
      ? gameType.changedCards()
      : matchWithPlacedTiles.openCards;

    const nextActivePlayerId = shouldChangeActivePlayer
      ? matchWithPlacedTiles.players.find(
          (player) => player.id !== matchWithPlacedTiles.activePlayerId,
        )?.id
      : matchWithPlacedTiles.activePlayerId;

    if (!nextActivePlayerId) {
      return { message: 'Error while changing turns', statusCode: 500 };
    }

    this.match = await this.matchesService.update({
      where: { id: this.match.id },
      data: {
        openCards,
        activePlayerId: nextActivePlayerId,
        turn: { increment: 1 },
        ...(isLastTurn(this.match, this.gameSettings) || winnerId
          ? { winnerId, status: MatchStatus.FINISHED, finishedAt: new Date() }
          : {}),
      },
    });
    const response = {
      updatedMatch: this.match,
      updatedTilesWithUnits,
      updatedPlayers,
    };
    this.matchLogService.create({
      matchId: this.Id,
      message: `Player  ${
        this.activePlayer.id
      } placed units on tiles ${translatedCoordinates.map(
        ([row, col]) => `(${row},${col})`,
      )}`,
      data: JSON.stringify(response),
    });
    return response;
  }

  private async changeTurn(args: any) {
    const turnTime = 30; // @todo
    const nextPlayerId = this.participants.find(
      (p) => p.playerNumber !== this.activePlayer?.playerNumber,
    )?.id;
    if (!nextPlayerId) {
      return;
    }
    const now = new Date();
    const nextTurnEndTimestamp = now.setSeconds(now.getSeconds() + turnTime);
    await this.matchesService.update({
      where: { id: this.match.id },
      data: {
        activePlayerId: nextPlayerId,
        // nextTurnEndTimestamp
      },
    });
  }

  public hover(coordinate: any, unitConstellation: any) {}
}
