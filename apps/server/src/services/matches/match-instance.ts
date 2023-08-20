import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  buildTileLookupId,
  getNewlyRevealedTiles,
  getTileLookup,
  shuffleArray,
} from 'coordinate-utils';
import {
  GameSettings,
  Match,
  MatchStatus,
  Participant,
  Map as SchnozMap,
  Tile,
  Unit,
  UnitConstellation,
  UnitType,
  User,
} from 'database';
import {
  checkConditionsForUnitConstellationPlacement,
  createCustomGame,
  determineWinner,
  isLastTurn,
} from 'game-logic';
import { Socket } from 'socket.io';
import {
  API_ERROR_CODES,
  ApiResponse,
  Coordinate,
  ErrorResponse,
  MatchInstanceEvent,
  ParticipantWithUser,
  PlacementRuleName,
  Special,
  TileWithUnit,
  TransformedConstellation,
} from 'types';
import { GameSettingsService } from '../game-settings/game-settings.service';
import { AppLoggerService } from '../logger/logger.service';
import { MapsService } from '../maps/maps.service';
import { MatchLogsService } from '../match-logs/match-logs.service';
import { ParticipantsService } from '../participants/participants.service';
import { TilesService } from '../tiles/tiles.service';
import { UsersService } from '../users/users.service';
import { MatchesService } from './matches.service';

export class MatchInstance {
  private match!: Match;
  private logger = new AppLoggerService(MatchInstance.name);
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

    try {
      this.map = await this.mapsService.findOne({ matchId: this.Id });
    } catch (e) {
      this.logger.error(e);
    }
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

  private checkConditionsForCreation(userId: string): {
    error: ErrorResponse | null;
  } {
    if (this.match.status === MatchStatus.STARTED) {
      return {
        error: {
          message: 'Match has already started',
          statusCode: 400,
          error: API_ERROR_CODES.MATCH_ALREADY_STARTED,
        },
      };
    }
    if (this.match.createdById !== userId) {
      return {
        error: {
          message: "Only the match's creator can start the match",
          error: API_ERROR_CODES.CANNOT_START_MATCH,
          statusCode: 403,
        },
      };
    }
    if (!this.map) {
      return {
        error: {
          error: API_ERROR_CODES.MAP_NOT_FOUND,
          message: 'No map',
          statusCode: 500,
        },
      };
    }
    if (!this.participants) {
      return {
        error: {
          error: API_ERROR_CODES.NO_PLAYERS,
          message: 'Players array is null',
          statusCode: 500,
        },
      };
    }
    if (this.participants.length < 2) {
      return {
        error: {
          error: API_ERROR_CODES.MATCH_NOT_FULL,
          message: 'Match is not full yet',
          statusCode: 400,
        },
      };
    }
    if (!this.gameSettings) {
      return {
        error: {
          error: API_ERROR_CODES.GAME_SETTINGS_NOT_FOUND,
          message: 'No game settings',
          statusCode: 500,
        },
      };
    }

    const isMapSizeEven = this.gameSettings.mapSize % 2 === 0;
    if (isMapSizeEven) {
      return {
        error: {
          error: API_ERROR_CODES.INVALID_MAP_SIZE,
          message: 'mapSize needs to be an odd integer',
          statusCode: 400,
        },
      };
    }

    return { error: null };
  }

  private checkConditionsForJoining = (
    participants: Participant[],
    userId: string,
  ): { error: API_ERROR_CODES | null } => {
    if (participants.some((participant) => participant.userId === userId)) {
      return { error: API_ERROR_CODES.CANNOT_JOIN_TWICE };
    }
    if (participants.length === 2) {
      return { error: API_ERROR_CODES.MATCH_FULL };
    }
    return { error: null };
  };

  public async joinMatch(userId: User['id']) {
    await this.sync();
    const { error: joinError } = this.checkConditionsForJoining(
      this.participants,
      userId,
    );
    if (joinError) {
      return joinError;
    }
    const playerNumber = this.participants.length + 1;
    const participant = await this.participantsService.create({
      userId,
      matchId: this.Id,
      playerNumber,
    });
    await this.matchLogService.create({
      matchId: this.Id,
      message: `Player ${userId} joined the match.`,
    });
    this.participants.push(participant);
    return participant;
  }

  public async startMatch(userId: User['id']): Promise<ApiResponse<Match>> {
    await this.sync();
    const { error: startError } = this.checkConditionsForCreation(userId);

    if (startError) {
      return startError;
    }

    const status = MatchStatus.STARTED;
    const startedAt = new Date();

    const activePlayerId = this.participants.find(
      (player) => player.userId === userId,
    )?.id;

    const openCards = shuffleArray<UnitConstellation>(
      Object.values({ ...UnitConstellation }),
    ).slice(0, 3);

    if (!this.gameSettings) {
      return {
        error: API_ERROR_CODES.GAME_SETTINGS_NOT_FOUND,
        message: 'No game settings',
        statusCode: 500,
      };
    }

    const turn = 1;
    const turnEndsAt = new Date(Date.now() + this.gameSettings.turnTime);

    this.match = await this.matchesService.update({
      where: { id: this.match.id },
      data: {
        openCards,
        status,
        startedAt,
        activePlayerId,
        turn,
        turnEndsAt,
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

    this.setNewTurnTimer();

    return this.match;
  }

  public async makeMove(
    participantId: Participant['id'],
    targetRow: Coordinate[0],
    targetCol: Coordinate[1],
    ignoredRules: PlacementRuleName[],
    unitConstellation: TransformedConstellation,
    specials: Special[],
  ) {
    await this.sync();
    this.logger.log('synced');
    if (!this.map) {
      return {
        error: {
          error: API_ERROR_CODES.MAP_NOT_FOUND,
          message: 'Map is missing',
          statusCode: 500,
        },
      };
    }

    if (!this.activePlayer) {
      return {
        error: {
          error: API_ERROR_CODES.ACTIVE_PLAYER_NOT_SET,
          message: 'Active player is not set',
          statusCode: 500,
        },
      };
    }

    if (!this.tilesWithUnits) {
      return {
        error: {
          error: API_ERROR_CODES.TILES_NOT_FOUND,
          message: 'No tiles',
          statusCode: 500,
        },
      };
    }

    if (!this.gameSettings) {
      return {
        error: {
          error: API_ERROR_CODES.GAME_SETTINGS_NOT_FOUND,
          message: 'No game settings',
          statusCode: 500,
        },
      };
    }
    this.logger.log('401');

    const currentBonusPoints =
      this.activePlayer.bonusPoints + unitConstellation.value;

    const canAffordSpecials =
      currentBonusPoints >=
      specials.reduce((totalCost, special) => {
        return totalCost + special.cost;
      }, 0);

    if (!canAffordSpecials) {
      return {
        error: {
          error: API_ERROR_CODES.BONUS_POINTS_NOT_ENOUGH,
          message: 'Not enough bonus points for specials',
          statusCode: 400,
        },
      };
    }

    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
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
    console.log(translatedCoordinates);

    translatedCoordinates.forEach((coordinate) => {
      const { mapId, row, col } = tileLookup[buildTileLookupId(coordinate)];
      const updatePayload = {
        where: { mapId_row_col: { mapId, row, col } },
        data: {
          unit: { create: { type: UnitType.UNIT, ownerId: participantId } },
        },
      };
      // this.logger.log('updatePayload', updatePayload);
      updateTilesPromises.push(this.tilesService.update(updatePayload));
    });

    console.log(revealedTiles);

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
    const updatedTilesWithUnits: any = [];
    for (const element of updateTilesPromises) {
      this.logger.log('!!!element', typeof element);
      updatedTilesWithUnits.push(await element);
    }
    // updatedTilesWithUnits = await Promise.all(updateTilesPromises);
    const matchWithPlacedTiles = await this.matchesService.findOneRich({
      id: this.match.id,
    });

    if (!matchWithPlacedTiles?.activePlayer || !matchWithPlacedTiles?.map) {
      return { message: 'Match could not be fetched', statusCode: 500 };
    }

    if (!this.activePlayer) {
      return { message: 'Error while placing', statusCode: 500 };
    }

    this.logger.log('496');
    const gameType = createCustomGame(this.gameSettings?.rules ?? null);
    const playersWithUpdatedScore = gameType.evaluate(matchWithPlacedTiles);

    const updatedPlayers: ParticipantWithUser[] = [];
    this.logger.log('503');
    for (const player of playersWithUpdatedScore) {
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
    this.logger.log('556');
    this.match = await this.matchesService.update({
      where: { id: this.match.id },
      data: {
        openCards,
        turnEndsAt: new Date(Date.now() + this.gameSettings.turnTime),
        activePlayerId: nextActivePlayerId,
        turn: { increment: 1 },
        ...(isLastTurn(this.match, this.gameSettings) || winnerId
          ? { winnerId, status: MatchStatus.FINISHED, finishedAt: new Date() }
          : {}),
      },
    });
    this.logger.log('after this.match = await this.matchesService.update({');
    if (!this.match.finishedAt) {
      this.setNewTurnTimer();
    }

    const response = {
      updatedMatch: this.match,
      updatedTilesWithUnits,
      updatedPlayers,
    };
    this.logger.log('this.matchLogService.create({');
    this.matchLogService.create({
      matchId: this.Id,
      message: `Player ${
        this.activePlayer.id
      } placed units on tiles ${translatedCoordinates.map(
        ([row, col]) => `(${row},${col})`,
      )}`,
      data: JSON.stringify(response),
    });
    return response;
  }

  private async turnTimerRanOut() {
    await this.sync();

    if (!this.activePlayer) {
      return {
        error: {
          error: API_ERROR_CODES.ACTIVE_PLAYER_NOT_SET,
          message: 'Active player is not set',
          statusCode: 500,
        },
      };
    }

    if (!this.gameSettings) {
      return {
        error: {
          error: API_ERROR_CODES.GAME_SETTINGS_NOT_FOUND,
          message: 'No game settings',
          statusCode: 500,
        },
      };
    }

    const gameType = createCustomGame(this.gameSettings?.rules ?? null);

    const winnerId =
      determineWinner(this.match, this.gameSettings, this.participants)?.id ??
      null;

    const shouldChangeActivePlayer = gameType.shouldChangeActivePlayer(
      this.match.turn,
    );

    const shouldChangeCards = gameType.shouldChangeCards(this.match.turn);

    const openCards = shouldChangeCards
      ? gameType.changedCards()
      : this.match.openCards;

    const nextActivePlayerId = shouldChangeActivePlayer
      ? this.participants.find(
          (participant) => participant.id !== this.match.activePlayerId,
        )?.id
      : this.match.activePlayerId;

    if (!nextActivePlayerId) {
      return { message: 'Error while changing turns', statusCode: 500 };
    }

    this.match = await this.matchesService.update({
      where: { id: this.match.id },
      data: {
        openCards,
        activePlayerId: nextActivePlayerId,
        turnEndsAt: new Date(Date.now() + this.gameSettings.turnTime),
        turn: { increment: 1 },
        ...(isLastTurn(this.match, this.gameSettings) || winnerId
          ? { winnerId, status: MatchStatus.FINISHED, finishedAt: new Date() }
          : {}),
      },
    });

    if (!this.match.finishedAt) {
      this.setNewTurnTimer();
    }

    const response = {
      updatedMatch: this.match,
    };

    this.eventEmitter.emit(
      MatchInstanceEvent.TURN_TIMER_RAN_OUT,
      response.updatedMatch,
    );

    this.matchLogService.create({
      matchId: this.Id,
      message: `Player ${this.activePlayer.id} did not do their move in time. Changing turns... `,
      data: JSON.stringify(response),
    });
  }

  private setNewTurnTimer() {
    if (!this.match.turnEndsAt) {
      throw new InternalServerErrorException(
        'Error while setting end turn time',
      );
    }

    const remainingTimeInMs =
      new Date(this.match.turnEndsAt).getTime() - Date.now();

    this.turnTimer = setTimeout(() => {
      this.turnTimerRanOut();
    }, remainingTimeInMs);
  }
}
