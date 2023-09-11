import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets"
import { Match, Participant, User } from "database"
import { Server, Socket } from "socket.io"
import {
  ClientEvent,
  Coordinate,
  TransformedConstellation,
  MatchInstanceEvent,
  PlacementRuleName,
  ServerEvent,
  Special,
  isSpecial,
  isErrorResponse,
} from "types"
import { GameSettingsService } from "../game-settings/game-settings.service"
import { AppLoggerService } from "../logger/logger.service"
import { MapsService } from "../maps/maps.service"
import { MatchLogsService } from "../match-logs/match-logs.service"
import { ParticipantsService } from "../participants/participants.service"
import { TilesService } from "../tiles/tiles.service"
import { UsersService } from "../users/users.service"
import { MatchInstance } from "./match-instance"
import { MatchesService } from "./matches.service"

@WebSocketGateway({ cors: { origin: "*" } })
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new AppLoggerService(MatchGateway.name)

  @WebSocketServer()
  server!: Server
  private clients = new Map<
    Socket["id"],
    { userId: User["id"]; matchInstance: MatchInstance }
  >()
  private matches = new Map<MatchInstance["Id"], MatchInstance>()

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly matchesService: MatchesService,
    private readonly mapsService: MapsService,
    private readonly participantsService: ParticipantsService,
    private readonly tilesService: TilesService,
    private readonly usersService: UsersService,
    private readonly matchLogsService: MatchLogsService,
    private readonly gameSettingsService: GameSettingsService,
  ) {}

  private getClientForUserId(userId: User["id"]) {
    const clientId = Array.from(this.clients.entries()).find(
      ([, { userId: id }]) => id === userId,
    )?.[0]
    return clientId ? this.server.sockets.sockets.get(clientId) : undefined
  }

  private getUserIdForClient(clientId: Socket["id"]) {
    return this.clients.get(clientId)?.userId
  }

  private getMatchInstanceForClient(clientId: Socket["id"]) {
    return this.clients.get(clientId)?.matchInstance
  }

  async handleConnection(client: Socket) {
    const { matchId, userId } = client.handshake.query

    this.logger.verbose(matchId + " ---------- " + userId)

    if (typeof matchId !== "string" || typeof userId !== "string") {
      this.logger.error(
        `Incomplete connection query. userId: "${userId}", match: "${matchId}"`,
      )
      client.disconnect()
      return
    }
    this.logger.verbose(
      `Incoming connection from "${userId}" to match "${matchId}"`,
    )

    let matchInstance = this.matches.get(matchId)
    if (!matchInstance) {
      this.logger.verbose(
        `No match instance found for match "${matchId}". Creating new...`,
      )
      matchInstance = new MatchInstance(
        matchId,
        this.eventEmitter,
        this.matchesService,
        this.gameSettingsService,
        this.mapsService,
        this.participantsService,
        this.matchLogsService,
        this.tilesService,
        this.usersService,
      )
      this.clients.set(client.id, { userId, matchInstance })
      this.matches.set(matchId, matchInstance)
      try {
        this.logger.verbose(`Initializing match instance for "${matchId}"`)
        await matchInstance.init()
      } catch (e) {
        this.logger.error(e)
        client.disconnect()
        return
      }
    } else {
      this.logger.verbose(
        `Match instance for client "${client.id}" found. Reusing...`,
      )
      this.clients.set(client.id, { userId, matchInstance })
    }
    try {
      this.logger.verbose("connecting client", client, userId)

      await matchInstance.connect(client, userId)
      await this.cleanup()
    } catch (e) {
      this.logger.error("Couldn't connect client to match")
      this.logger.error(e)
      client.disconnect()
    }
    this.logger.verbose(`PLAYER_CONNECTED_TO_MATCH "${matchId}"`)
    const connectedUserIds = Array.from(matchInstance.sockets.keys())
    this.server.to(matchId).emit(ServerEvent.PLAYER_CONNECTED_TO_MATCH, {
      match: matchInstance.Match,
      map: matchInstance.Map,
      tilesWithUnits: matchInstance.TilesWithUnits,
      gameSettings: matchInstance.GameSettings,
      players: matchInstance.Participants,
      connectedPlayers: matchInstance.Participants.filter((p) => {
        return connectedUserIds.includes(p.userId)
      }),
    })
    this.logger.verbose(`Client connected to match "${matchId}"`)
    this.logger.verbose(
      `Current clients in match "${matchId}": ${Array.from(
        Array.from(matchInstance.sockets.values()).map((v) => v.id),
      )}`,
    )
    this.logger.verbose(`Current clients: ${Array.from(this.clients.keys())}`)
  }

  handleDisconnect(client: Socket) {
    const matchInstance = this.getMatchInstanceForClient(client.id)
    const { userId } = client.handshake.query
    if (typeof userId !== "string") {
      return
    }
    if (!matchInstance) {
      this.logger.error(`No match for client ${client.id} found`)
      return
    }
    matchInstance.disconnect(client, userId)
    this.server.to(matchInstance.Id).emit(
      ServerEvent.PLAYER_DISCONNECTED_FROM_MATCH,
      matchInstance.Participants.filter((p) => p.userId !== userId),
    )
    this.clients.delete(client.id)
    this.logger.verbose(`Client "${client.id}" disconnected`)
    this.logger.verbose(`Current clients: ${Array.from(this.clients.keys())}`)
  }

  async cleanup() {
    const sockets = await this.server.sockets.fetchSockets()
    const socketIds: string[] = []
    for (const socket of sockets) {
      socketIds.push(socket.id)
    }
    Array.from(this.clients.keys()).forEach((clientId) => {
      if (!socketIds.includes(clientId)) {
        this.clients.delete(clientId)
      }
    })
  }

  @SubscribeMessage(ClientEvent.START_MATCH)
  async handleStartMatch(client: Socket, data: { userId: User["id"] }) {
    const { userId } = data
    const matchInstance = this.getMatchInstanceForClient(client.id)
    if (!matchInstance) {
      this.logger.error(`No match for client ${client.id} found`)
      return
    }
    try {
      const apiResponse = await matchInstance.startMatch(userId)
      if (isErrorResponse(apiResponse)) {
        this.logger.error(apiResponse)
        this.server.to(client.id).emit(ServerEvent.ERROR, apiResponse)
        return
      }
      this.server.to(matchInstance.Match.id).emit(ServerEvent.STARTED_MATCH, {
        match: matchInstance.Match,
        map: matchInstance.Map,
        tilesWithUnits: matchInstance.TilesWithUnits,
        players: matchInstance.Participants,
        users: matchInstance.Users,
      })
    } catch (e) {
      this.logger.error(e)
      client.disconnect()
    }
  }
  @SubscribeMessage(ClientEvent.UPDATE_GAME_SETTINGS)
  async handleUpdateGameSettings(client: Socket, data: { [x: string]: any }) {
    const matchInstance = this.getMatchInstanceForClient(client.id)

    if (!matchInstance) {
      this.logger.error(`No connection for client ${client.id} found`)
      return
    }

    try {
      const updatedGameSettings = await matchInstance.setGameSettings(data)
      this.server
        .to(matchInstance.Match.id)
        .emit(ServerEvent.UPDATED_GAME_SETTINGS, updatedGameSettings)
    } catch (e) {
      this.logger.error(e)
      client.disconnect()
    }

    console.log("success")
    console.log(this.getUserIdForClient(client.id))

    // const matchInstance = this.matches.get(matchId);
    // if (matchInstance) {
    //   matchInstance.disconnect(client, userId);
    //   this.server.to(matchId).emit('disconnectedFromMatch', matchId);
    // } else {
    //   client.emit('matchNotFound', matchId);
    // }
  }
  @SubscribeMessage(ClientEvent.KICK_PARTICIPANT)
  async kickParticipant(client: Socket, data: { participant: Participant }) {
    const { participant } = data
    const matchInstance = this.getMatchInstanceForClient(client.id)
    if (!matchInstance) {
      this.logger.error(`No connection for client ${client.id} found`)
      return
    }
    const clientIsHost =
      matchInstance.Match.createdById === this.getUserIdForClient(client.id)
    if (!clientIsHost) {
      this.logger.error(`Client ${client.id} is not host`)
      return
    }
    try {
      await matchInstance.kickParticipant(participant.id)

      const clientOfKickedParticipant = this.getClientForUserId(
        participant.userId,
      )
      console.log(clientOfKickedParticipant)

      this.server
        .to(matchInstance.Match.id)
        .emit(ServerEvent.KICKED_PARTICIPANT, matchInstance.Participants)

      clientOfKickedParticipant?.disconnect()
    } catch (e) {
      this.logger.error(e)
      client.disconnect()
    }

    console.log("success")
    console.log(this.getUserIdForClient(client.id))

    // const matchInstance = this.matches.get(matchId);
    // if (matchInstance) {
    //   matchInstance.disconnect(client, userId);
    //   this.server.to(matchId).emit('disconnectedFromMatch', matchId);
    // } else {
    //   client.emit('matchNotFound', matchId);
    // }
  }
  @SubscribeMessage(ClientEvent.MAKE_MOVE)
  async handleMove(
    client: Socket,
    data: {
      participantId: Participant["id"]
      row: Coordinate[0]
      col: Coordinate[1]
      ignoredRules: PlacementRuleName[]
      specials: Special[]
      unitConstellation: TransformedConstellation
    },
  ) {
    this.logger.verbose("MAKE MOVE")

    const {
      participantId,
      row: targetRow,
      col: targetCol,
      ignoredRules,
      specials,
      unitConstellation,
    } = data

    if (
      !participantId ||
      typeof targetRow !== "number" ||
      typeof targetCol !== "number"
    ) {
      this.logger.error("Query is not complete")
      return
    }

    if (!(Array.isArray(specials) && specials.every(isSpecial))) {
      this.logger.error("Invalid query param value for specials.")
      return
    }

    if (!Array.isArray(ignoredRules)) {
      this.logger.error(
        "ignoredRules must be an Array. Received: " + ignoredRules,
      )
      return
    }

    const matchInstance = this.getMatchInstanceForClient(client.id)

    if (!matchInstance) {
      this.logger.error(`No connection for client ${client.id} found`)
      return
    }

    try {
      this.logger.verbose(
        "making move with",
        participantId,
        targetRow,
        targetCol,
        ignoredRules,
        unitConstellation,
        specials,
      )
      const updates = await matchInstance.makeMove(
        participantId,
        targetRow,
        targetCol,
        ignoredRules,
        unitConstellation,
        specials,
      )
      this.logger.verbose("made move")
      this.server
        .to(matchInstance.Match.id)
        .emit(ServerEvent.MADE_MOVE, updates)
      this.logger.verbose("emitted move")
    } catch (e) {
      this.logger.verbose("error")

      this.logger.error("update match failed")
      this.logger.error(e)
      client.disconnect()
    }
  }
  @SubscribeMessage(ClientEvent.HOVER)
  async handleOpponentHover(client: Socket, data: { [x: string]: any }) {
    const matchInstance = this.getMatchInstanceForClient(client.id)

    if (!matchInstance) {
      this.logger.error(`No connection for client ${client.id} found`)
      return
    }

    const hoveringPlayerUserId = this.getUserIdForClient(client.id)
    if (!hoveringPlayerUserId) {
      this.logger.error(
        `Could not find client for hovering player ${client.id}`,
      )
      return
    }

    const opponent = matchInstance.getOpponentByUserId(hoveringPlayerUserId)
    if (!opponent) {
      this.logger.error("Could not find opponent in match instance")
      return
    }

    const opponentClient = matchInstance.sockets.get(opponent.userId)
    if (!opponentClient) {
      // this.logger.error('Could not find opponent client');
      return
    }

    try {
      this.server.to(opponentClient.id).emit(ServerEvent.HOVERED, data)
    } catch (e) {
      this.logger.error(e)
      client.disconnect()
    }
  }
  @OnEvent(MatchInstanceEvent.TURN_TIMER_RAN_OUT)
  handleEndTurn(match: Match) {
    this.server.to(match.id).emit(ServerEvent.TURN_TIMER_RAN_OUT, { match })
  }
}
