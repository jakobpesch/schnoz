/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Center,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Participant, UnitType } from "database"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { MapContainer } from "../../components/map/MapContainer"
import { MapFog } from "../../components/map/MapFog"
import { MapHoveredHighlights } from "../../components/map/MapHoveredHighlights"
import { MapPlaceableTiles } from "../../components/map/MapPlaceableTiles"
import { MapRuleEvaluations } from "../../components/map/MapRuleEvaluations"
import { MapTerrains } from "../../components/map/MapTerrains"
import { MapUnits } from "../../components/map/MapUnits"
import { UICardsView } from "../../components/ui/UICardsView"
import { UILoadingIndicator } from "../../components/ui/UILoadingIndicator"
import { UILoggingView } from "../../components/ui/UILoggingView"
import { UIPostMatchView } from "../../components/ui/UIPostMatchView"
import { UIPreMatchView } from "../../components/ui/UIPreMatchView"
import { UIScoreView } from "../../components/ui/UIScoreView"
import { UITurnsView } from "../../components/ui/UITurnsView"
import { PlacementRuleName } from "../../gameLogic/PlacementRule"
import { useCards } from "../../hooks/useCards"
import { useMatch } from "../../hooks/useMatch"
import { useMatchStatus } from "../../hooks/useMatchStatus"
import { usePlaceableCoordinates } from "../../hooks/usePlaceableCoordinates"
import { useTiles } from "../../hooks/useTiles"
import {
  Coordinate2D,
  IUnitConstellation,
} from "../../models/UnitConstellation.model"
import { getCookie } from "../../services/CookieService"
import {
  checkConditionsForUnitConstellationPlacement,
  createMap,
  expandBuildRadiusByOne,
  Special,
} from "../../services/GameManagerService"
import {
  socketApi,
  UpdateGameSettingsPayload,
} from "../../services/SocketService"
import { TileWithUnit } from "../../types/Tile"
import {
  coordinatesAreEqual,
  getNewlyRevealedTiles,
} from "../../utils/coordinateUtils"

export function useUserId() {
  try {
    return getCookie("userId")
  } catch (e) {
    return null
  }
}

const MatchView = () => {
  const router = useRouter()
  const userId = useUserId()

  const matchId = typeof router.query.id === "string" ? router.query.id : ""

  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [isChangingTurns, setIsChangingTurns] = useState(false)
  const [activatedSpecials, setActivatedSpecials] = useState<Special[]>([])

  const {
    match,
    gameSettings,
    participants,
    map,
    tilesWithUnits,
    updatedTilesWithUnits,
    connectedParticipants,
  } = useMatch(userId ?? "", matchId)

  const you = participants?.find((player) => player.userId === userId)
  const activePlayer = participants?.find(
    (player) => player.id === match?.activePlayerId
  )
  const yourTurn = userId === activePlayer?.userId

  const setStatus = (status: string) => {
    setStatusLog([
      new Date().toLocaleTimeString() + ": " + status,
      ...statusLog,
    ])
  }
  const [statusLog, setStatusLog] = useState<string[]>([])

  const [showRuleEvaluationHighlights, setShowRuleEvaluationHighlights] =
    useState<Coordinate2D[]>([])

  const { cards, selectedCard, setSelectedCard } = useCards(match, yourTurn)
  const { tileLookup, terrainTiles, unitTiles, fogTiles, halfFogTiles } =
    useTiles(tilesWithUnits)
  const { placeableCoordinates } = usePlaceableCoordinates(
    match,
    tilesWithUnits,
    participants,
    yourTurn,
    selectedCard,
    activatedSpecials
  )

  const { isPreMatch, wasStarted, isOngoing, isFinished } = useMatchStatus(
    match?.status
  )

  if (!you) {
    // you are not a participant of this match
    return (
      <Center height="100vh">
        <VStack>
          <Heading>Not a participant!</Heading>
          <Text>
            You are no participant of this match. {JSON.stringify(participants)}
          </Text>
          <Link href="/">
            <Button>Back to menu</Button>
          </Link>
        </VStack>
      </Center>
    )
  }

  if (
    !you ||
    !userId ||
    !match ||
    !participants ||
    (!isPreMatch && !map) ||
    (!isPreMatch && !tilesWithUnits) ||
    (!isPreMatch && !activePlayer) ||
    !gameSettings
  ) {
    console.log("match data not yet complete", {
      you,
      userId,
      match,
      map,
      players: participants,
      tilesWithUnits,
      activePlayer,
    })
    return null
  }

  if (!socketApi.IsConnected) {
    return (
      <Center height="100vh">
        <VStack>
          <Heading>Disconnected</Heading>
          <Text>You were disconnected by the server.</Text>
          <Button
            isLoading={socketApi.IsConnecting}
            onClick={() => {
              socketApi.connectToMatch(userId, matchId)
            }}
          >
            Reconnect
          </Button>
        </VStack>
      </Center>
    )
  }

  const onTileClick = async (
    row: number,
    col: number,
    rotatedClockwise: IUnitConstellation["rotatedClockwise"],
    mirrored: IUnitConstellation["mirrored"]
  ) => {
    if (isUpdatingMatch) {
      return
    }

    if (!userId) {
      return
    }

    if (!selectedCard) {
      return
    }

    const unitConstellation: IUnitConstellation = {
      coordinates: selectedCard.coordinates,
      value: selectedCard.value,
      rotatedClockwise,
      mirrored,
    }

    try {
      if (!you.id) {
        throw new Error("Could not find your id")
      }

      const ignoredRules: PlacementRuleName[] =
        unitConstellation.coordinates.length === 1 &&
        coordinatesAreEqual(unitConstellation.coordinates[0], [0, 0])
          ? ["ADJACENT_TO_ALLY"]
          : []

      const { translatedCoordinates, error } =
        checkConditionsForUnitConstellationPlacement(
          [row, col],
          unitConstellation,
          match,
          activePlayer,
          map,
          tilesWithUnits,
          tileLookup,
          ignoredRules,
          you.id,
          activatedSpecials
        )

      if (error) {
        setStatus(error.message)
        return
      }
      const tilesWithUnitsClone = JSON.parse(
        JSON.stringify(tilesWithUnits)
      ) as TileWithUnit[]

      translatedCoordinates.forEach((coordinate, index) => {
        const tile = tilesWithUnitsClone.find((tile) =>
          coordinatesAreEqual([tile.row, tile.col], coordinate)
        )
        if (!tile) {
          return
        }
        tile.unit = {
          id: "pending-unit-" + index,
          row: tile.row,
          col: tile.col,
          mapId: tile.mapId,
          ownerId: you.id,
          type: UnitType.UNIT,
        }
      })

      const { tiles: revealedTiles, error: revealedError } =
        getNewlyRevealedTiles(tileLookup, translatedCoordinates)

      if (revealedError) {
        setStatus(revealedError.message)
        return
      }

      // const optimisticData: MatchRich = {
      //   ...match,
      //   turn: match.turn + 1,
      //   map: {
      //     ...mapClone,
      //     tiles: mapClone.tiles.map((tile, index) => {
      //       const updatedTile: TileWithUnit = { ...tile }
      //       if (
      //         coordinateIncludedIn(
      //           revealedTiles.map((tile) => [tile.row, tile.col]),
      //           [updatedTile.row, updatedTile.col]
      //         )
      //       ) {
      //         updatedTile.visible = true
      //       }
      //       if (
      //         coordinateIncludedIn(translatedCoordinates, [
      //           updatedTile.row,
      //           updatedTile.col,
      //         ])
      //       ) {
      //         updatedTile.unit = {
      //           id: "pending-unit-" + index,
      //           row: tile.row,
      //           col: tile.col,
      //           mapId: tile.mapId,
      //           ownerId: participantId,
      //           type: UnitType.UNIT,
      //         }
      //       }

      //       return updatedTile
      //     }),
      //   },
      //   updatedAt: new Date(),
      // }
      setIsUpdatingMatch(true)

      await socketApi.makeMove({
        matchId: match.id,
        row,
        col,
        participantId: you.id,
        unitConstellation,
        ignoredRules,
        specials: ignoredRules.includes("ADJACENT_TO_ALLY")
          ? activatedSpecials.filter(
              (special) => special.type !== "EXPAND_BUILD_RADIUS_BY_1"
            )
          : activatedSpecials,
      })
      setIsUpdatingMatch(false)
      setSelectedCard(null)
      setActivatedSpecials([])
      setStatus(`Placed unit on tile (${row}|${col})`)
    } catch (e: any) {
      setStatus(e.message)
      console.error(e.message)
    }
  }

  const handleStartGameClick = async () => {
    if (!userId) {
      return
    }

    try {
      setIsUpdatingMatch(true)
      if (!map) {
        await createMap(match.id, userId)
      }
      await socketApi.startMatch(userId)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdatingMatch(false)
    }
  }

  const handleSettingsChange = async (
    settings: Omit<UpdateGameSettingsPayload, "matchId">
  ) => {
    try {
      await socketApi.updateGameSettings(settings)
      setStatus("Updated Settings")
    } catch (e: any) {
      setStatus(e.message)
    }
  }

  const handleKick = async (participant: Participant) => {
    try {
      await socketApi.kickParticipant(participant)
      setStatus("Kicked Participant")
    } catch (e: any) {
      setStatus(e.message)
    }
  }

  return (
    <Container height="100vh" color="white">
      {isPreMatch && (
        <UIPreMatchView
          py="16"
          participants={participants}
          connectedParticipants={connectedParticipants ?? []}
          isLoading={isUpdatingMatch /*|| isValidating*/}
          settings={gameSettings ?? null}
          onSettingsChange={handleSettingsChange}
          onStartGameClick={handleStartGameClick}
          userId={userId}
          createdById={match.createdById}
          matchId={match.id}
          onKick={handleKick}
        />
      )}
      {wasStarted && map && tilesWithUnits && activePlayer && (
        <>
          <MapContainer
            id="map-container"
            map={map}
            cursor={selectedCard ? "none" : "default"}
          >
            {isOngoing && /*!isLoadingMatch && */ !isUpdatingMatch && (
              <MapPlaceableTiles placeableCoordinates={placeableCoordinates} />
            )}

            <MapUnits
              unitTiles={unitTiles}
              players={participants}
              updatedUnitTiles={updatedTilesWithUnits ?? []}
            />
            {showRuleEvaluationHighlights && (
              <MapRuleEvaluations coordinates={showRuleEvaluationHighlights} />
            )}
            <MapTerrains terrainTiles={terrainTiles} />
            <MapFog fogTiles={fogTiles} halfFogTiles={halfFogTiles} />
            {
              /*!isLoadingMatch && */ you &&
                !isUpdatingMatch &&
                !isChangingTurns && (
                  <MapHoveredHighlights
                    you={you}
                    activePlayer={activePlayer}
                    hide={isFinished}
                    specials={[expandBuildRadiusByOne]}
                    activeSpecials={activatedSpecials}
                    setSpecial={(specialType, active) => {
                      if (active) {
                        setActivatedSpecials([expandBuildRadiusByOne])
                      } else {
                        setActivatedSpecials([])
                      }
                    }}
                    card={selectedCard}
                    onTileClick={onTileClick}
                  />
                )
            }
          </MapContainer>

          <UIScoreView
            participants={participants}
            connectedParticipants={connectedParticipants ?? []}
            tilesWithUnits={tilesWithUnits}
            rules={gameSettings?.rules ?? []}
            onRuleHover={(coordinates) => {
              setShowRuleEvaluationHighlights(coordinates)
            }}
          />
        </>
      )}
      {isFinished && (
        <UIPostMatchView
          winner={
            participants.find((player) => player.id === match.winnerId) ?? null
          }
        />
      )}
      {isOngoing && activePlayer && (
        <>
          <UITurnsView
            match={match}
            players={participants}
            gameSettings={gameSettings}
          />
          {/* {you?.bonusPoints != null && (
            <UIBonusPointsView bonusPoints={you.bonusPoints} />
          )} */}
          <UICardsView
            selectedCard={selectedCard}
            cards={cards}
            readonly={!yourTurn}
            onSelect={(card) => {
              const insufficientBonusPoints =
                activePlayer.bonusPoints + (card.value ?? 0) <
                activatedSpecials.reduce((a, s) => a + s.cost, 0)

              const isSinglePiece =
                card.coordinates.length === 1 &&
                coordinatesAreEqual(card.coordinates[0], [0, 0])

              if (isSinglePiece || insufficientBonusPoints) {
                setActivatedSpecials([])
              }
              setSelectedCard(card)
            }}
          />

          {/* {activePlayer && (
            <UITurnChangeIndicator
              activePlayer={activePlayer}
              onChangingTurnsStart={() => {
                setIsChangingTurns(true)
              }}
              onChangingTurnsEnd={() => {
                setIsChangingTurns(false)
              }}
            />
          )} */}
        </>
      )}
      <UILoggingView statusLog={statusLog} />
      <UILoadingIndicator
        loading={/*!isLoadingMatch ||  isLoadingUpdate || */ isUpdatingMatch}
      />
    </Container>
  )
}

export default MatchView
