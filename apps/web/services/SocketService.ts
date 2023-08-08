import { GameSettings, Map, Match, Participant, Unit, User } from "database"
import { Socket, io } from "socket.io-client"
import {
  ClientEvent,
  Coordinate,
  TransformedConstellation,
  ParticipantWithUser,
  PlacementRuleName,
  ServerEvent,
  Special,
  TileWithUnit,
} from "types"

// TODO: Make type proper
export type UpdateGameSettingsPayload = Partial<Omit<GameSettings, "id">>

export class SocketIOApi {
  private socket: Socket | undefined

  private isConnecting = false
  public get IsConnecting() {
    return this.isConnecting
  }
  public get IsConnected() {
    return !!this.socket?.connected
  }

  private callbacks: {
    setIsConnecting?: (isConnecting: boolean) => void
    setMatch?: (match: Match) => void
    setGameSettings?: (gameSettings: GameSettings) => void
    setMap?: (map: Map) => void
    setTilesWithUnits?: (tilesWithUnits: TileWithUnit[]) => void
    setUpdatedTilesWithUnits?: (updatedTilesWithUnits: TileWithUnit[]) => void
    setUnits?: (units: Unit[]) => void
    setParticipants?: (players: ParticipantWithUser[]) => void
    setConnectedParticipants?: (players: ParticipantWithUser[]) => void
    setOpponentsHoveredTiles?: (hoveringTiles: Coordinate[] | null) => void
    setLastSynced?: (lastSynced: string) => void
  } = {}

  public setCallbacks = (callbacks: typeof this.callbacks) => {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  public connectToMatch = (userId: string, matchId: string) => {
    this.isConnecting = true
    this.socket = io("http://localhost:3000", {
      query: { userId, matchId },
      autoConnect: false,
    })
    this.socket.on("connect", () => {
      console.log("connectToMatch socket.on('connect')")

      this.isConnecting = false
    })
    this.socket.on(
      ServerEvent.PLAYER_CONNECTED_TO_MATCH,
      (data: Parameters<typeof this.onPlayerConnectedToMatch>[number]) => {
        this.onPlayerConnectedToMatch(data)
      }
    )
    this.socket.on(
      ServerEvent.PLAYER_DISCONNECTED_FROM_MATCH,
      (data: Parameters<typeof this.onPlayerDisconnectedFromMatch>[number]) => {
        this.onPlayerDisconnectedFromMatch(data)
      }
    )
    this.socket.on(
      ServerEvent.STARTED_MATCH,
      (data: Parameters<typeof this.onStartedMatch>[number]) => {
        this.onStartedMatch(data)
      }
    )
    this.socket.on(
      ServerEvent.KICKED_PARTICIPANT,
      (data: Parameters<typeof this.onKickedParticipant>[number]) => {
        this.onKickedParticipant(data)
      }
    )
    this.socket.on(
      ServerEvent.UPDATED_GAME_SETTINGS,
      (data: Parameters<typeof this.onUpdatedGameSettings>[number]) => {
        this.onUpdatedGameSettings(data)
      }
    )
    this.socket.on(
      ServerEvent.HOVERED,
      (data: Parameters<typeof this.onHovered>[number]) => {
        this.onHovered(data)
      }
    )
    this.socket.on(
      ServerEvent.MADE_MOVE,
      (data: Parameters<typeof this.onMadeMove>[number]) => {
        this.onMadeMove(data)
      }
    )
    this.socket.on(
      ServerEvent.TURN_TIMER_RAN_OUT,
      (data: Parameters<typeof this.onEndTurnTimestamp>[number]) => {
        this.onEndTurnTimestamp(data)
      }
    )

    this.socket.on("disconnect", () => {
      console.log("disconnected")
    })

    this.socket.on("connect_error", (error: Error) => {
      console.error("connect error", error)
      this.isConnecting = false
      throw error
    })

    this.socket.connect()
  }

  private onPlayerConnectedToMatch = (payload: {
    match: Match
    gameSettings?: GameSettings
    map?: Map
    tilesWithUnits?: TileWithUnit[]
    players?: ParticipantWithUser[]
    connectedPlayers?: ParticipantWithUser[]
  }) => {
    this.callbacks.setMatch?.(payload.match)
    if (payload.gameSettings) {
      this.callbacks.setGameSettings?.(payload.gameSettings)
    }
    if (payload.players) {
      this.callbacks.setParticipants?.(payload.players)
    }
    if (payload.connectedPlayers) {
      this.callbacks.setConnectedParticipants?.(payload.connectedPlayers)
    }
    if (payload.tilesWithUnits) {
      this.callbacks.setTilesWithUnits?.(payload.tilesWithUnits)
    }
    if (payload.map) {
      this.callbacks.setMap?.(payload.map)
    }
  }

  private onPlayerDisconnectedFromMatch = (
    participants: ParticipantWithUser[]
  ) => {
    this.callbacks.setConnectedParticipants?.(participants)
  }

  private onUpdatedGameSettings = (gameSettings: GameSettings) => {
    this.callbacks.setGameSettings?.(gameSettings)
  }
  private onStartedMatch = (payload: {
    match: Match
    map: Map
    tilesWithUnits: TileWithUnit[]
    players: ParticipantWithUser[]
  }) => {
    this.callbacks.setMatch?.(payload.match)
    this.callbacks.setParticipants?.(payload.players)
    this.callbacks.setTilesWithUnits?.(payload.tilesWithUnits)
    this.callbacks.setMap?.(payload.map)
  }

  private onKickedParticipant = (
    remainingParticipants: ParticipantWithUser[]
  ) => {
    this.callbacks.setParticipants?.(remainingParticipants)
    this.callbacks.setConnectedParticipants?.(remainingParticipants)
  }
  private onHovered = (hoveredCoordinates: Coordinate[] | null) => {
    this.callbacks.setOpponentsHoveredTiles?.(hoveredCoordinates)
  }

  private onMadeMove = (payload: {
    updatedMatch: Match
    updatedTilesWithUnits: TileWithUnit[]
    updatedPlayers: ParticipantWithUser[]
  }) => {
    this.callbacks.setMatch?.(payload.updatedMatch)
    this.callbacks.setUpdatedTilesWithUnits?.(payload.updatedTilesWithUnits)
    this.callbacks.setParticipants?.(payload.updatedPlayers)
  }

  private onEndTurnTimestamp = (payload: { match: Match }) => {
    this.callbacks.setMatch?.(payload.match)
  }

  public sendRequest = async (request: { event: string; data?: any }) => {
    try {
      if (!this.socket?.connected) {
        console.error(new Error("Socket not connected"))
        return
      }

      this.socket.emit(request.event, request.data)
    } catch (error) {
      return error
    }
  }

  public async disconnect() {
    this.isConnecting = false
    this.socket?.disconnect()
  }

  async startMatch(userId: User["id"]) {
    socketApi.sendRequest({
      event: ClientEvent.START_MATCH,
      data: { userId },
    })
  }

  async kickParticipant(participant: Participant) {
    socketApi.sendRequest({
      event: ClientEvent.KICK_PARTICIPANT,
      data: { participant },
    })
  }

  async updateGameSettings(
    settings: Omit<UpdateGameSettingsPayload, "matchId">
  ) {
    const gameSettings: UpdateGameSettingsPayload = {}
    if (settings.mapSize) {
      gameSettings.mapSize = settings.mapSize
    }
    if (settings.rules) {
      gameSettings.rules = settings.rules
    }
    if (settings.maxTurns != null) {
      gameSettings.maxTurns = settings.maxTurns
    }
    if (settings.waterRatio != null) {
      gameSettings.waterRatio = settings.waterRatio
    }
    if (settings.treeRatio != null) {
      gameSettings.treeRatio = settings.treeRatio
    }
    if (settings.stoneRatio != null) {
      gameSettings.stoneRatio = settings.stoneRatio
    }
    if (settings.turnTime != null) {
      gameSettings.turnTime = settings.turnTime
    }

    await socketApi.sendRequest({
      event: ClientEvent.UPDATE_GAME_SETTINGS,
      data: gameSettings,
    })
  }

  async makeMove(payload: {
    matchId: string
    row: number
    col: number
    participantId: string
    unitConstellation: TransformedConstellation
    ignoredRules?: PlacementRuleName[]
    specials?: Special[]
  }) {
    await socketApi.sendRequest({
      event: ClientEvent.MAKE_MOVE,
      data: payload,
    })
  }

  async sendHoveredCoordinates(hoveredCoordinates: Coordinate[] | null) {
    await socketApi.sendRequest({
      event: ClientEvent.HOVER,
      data: hoveredCoordinates,
    })
  }
}

export const socketApi = new SocketIOApi()
