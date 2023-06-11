/* eslint-disable react-hooks/exhaustive-deps */
import { ArrowForwardIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Center,
  Circle,
  Container,
  HStack,
  Heading,
  Kbd,
  Spinner,
  Stack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react"
import { coordinatesAreEqual, getNewlyRevealedTiles } from "coordinate-utils"
import { Participant, UnitType } from "database"
import { checkConditionsForUnitConstellationPlacement } from "game-logic"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import {
  Coordinate,
  PlacementRuleName,
  SpecialType,
  TileWithUnit,
  TransformedConstellation,
} from "types"
import popSound from "../../assets/sfx/pop.mp3"
import { MapContainer } from "../../components/map/MapContainer"
import { MapFog } from "../../components/map/MapFog"
import { MapHoveredHighlights } from "../../components/map/MapHoveredHighlights"
import { MapPlaceableTiles } from "../../components/map/MapPlaceableTiles"
import { MapRuleEvaluations } from "../../components/map/MapRuleEvaluations"
import { MapTerrains } from "../../components/map/MapTerrains"
import { MapUnits } from "../../components/map/MapUnits"
import { UICardsView } from "../../components/ui/UICardsView"
import { UILoadingIndicator } from "../../components/ui/UILoadingIndicator"
import { UIPostMatchView } from "../../components/ui/UIPostMatchView"
import { UIPreMatchView } from "../../components/ui/UIPreMatchView"
import { UIScoreView, scaled } from "../../components/ui/UIScoreView"
import { UITurnChangeIndicator } from "../../components/ui/UITurnChangeIndicator"
import { UITurnTimer } from "../../components/ui/UITurnTimer"
import { UITurnsView } from "../../components/ui/UITurnsView"
import useAuth from "../../hooks/useAuth"
import { useCards } from "../../hooks/useCards"
import { useMatch } from "../../hooks/useMatch"
import { useMatchStatus } from "../../hooks/useMatchStatus"
import { usePlaceableCoordinates } from "../../hooks/usePlaceableCoordinates"
import { useTiles } from "../../hooks/useTiles"
import {
  Special,
  createMap,
  expandBuildRadiusByOne,
} from "../../services/GameManagerService"
import {
  UpdateGameSettingsPayload,
  socketApi,
} from "../../services/SocketService"

const MatchView = () => {
  const router = useRouter()
  const { profile } = useAuth()
  const userId = profile?.sub ?? ""
  const matchId = typeof router.query.id === "string" ? router.query.id : ""
  const toast = useToast()
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [isChangingTurns, setIsChangingTurns] = useState(false)
  const [activatedSpecials, setActivatedSpecials] = useState<Special[]>([])
  const playSound = () => {
    const audio = new Audio(popSound)
    audio.play()
  }
  const {
    match,
    gameSettings,
    participants,
    map,
    tilesWithUnits,
    updatedTilesWithUnits,
    connectedParticipants,
  } = useMatch(userId, matchId)

  const you = participants?.find((player) => player.userId === userId)

  const activePlayer = participants?.find(
    (player) => player.id === match?.activePlayerId
  )
  const yourTurn = userId === activePlayer?.userId

  const [showRuleEvaluationHighlights, setShowRuleEvaluationHighlights] =
    useState<Coordinate[]>([])

  const { cards, selectedCard, setSelectedCard } = useCards(match, yourTurn)
  const { tileLookup, terrainTiles, unitTiles, fogTiles, halfFogTiles } =
    useTiles(tilesWithUnits)
  const { placeableCoordinates } = usePlaceableCoordinates({
    match,
    map,
    activePlayer,
    tilesWithUnits,
    yourTurn,
    participants,
    selectedCard,
    activatedSpecials,
    you,
  })

  const { isPreMatch, wasStarted, isOngoing, isFinished } = useMatchStatus(
    match?.status
  )

  if (!match) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!you) {
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
    rotatedClockwise: TransformedConstellation["rotatedClockwise"],
    mirrored: TransformedConstellation["mirrored"]
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

    const unitConstellation: TransformedConstellation = {
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

      console.log({ translatedCoordinates, error })

      if (error) {
        toast({
          title: error.message,
          status: "info",
          position: "bottom-left",
        })
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
      playSound()
      setIsUpdatingMatch(false)
      setSelectedCard(null)
      setActivatedSpecials([])
    } catch (e: any) {
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
    } catch (e: any) {}
  }

  const handleKick = async (participant: Participant) => {
    try {
      await socketApi.kickParticipant(participant)
    } catch (e: any) {}
  }

  const hasExpandBuildRaidusByOneActive = activatedSpecials.some(
    (special) => special.type === "EXPAND_BUILD_RADIUS_BY_1"
  )

  const availableBonusPoints = you.bonusPoints + (selectedCard?.value ?? 0)

  const specialsCost = activatedSpecials.reduce((a, s) => a + s.cost, 0)
  const bonusFromSelectedCard = selectedCard?.value ?? 0
  const resultingBonusPoints =
    you.bonusPoints + bonusFromSelectedCard - specialsCost
  const setSpecial = (specialType: SpecialType, active: boolean) => {
    if (active) {
      setActivatedSpecials([expandBuildRadiusByOne])
    } else {
      setActivatedSpecials([])
    }
  }
  return (
    <Container width="100vw" height="100vh" color="white">
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
            bg="green"
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
                    setSpecial={setSpecial}
                    card={selectedCard}
                    onTileClick={onTileClick}
                  />
                )
            }
          </MapContainer>
          {!isFinished && (
            <Box
              position="fixed"
              left={scaled(4)}
              top={scaled(120)}
              cursor="default"
            >
              {match.turnEndsAt && (
                <UITurnTimer
                  turnEndsAt={new Date(match.turnEndsAt).toISOString()}
                />
              )}
              <Stack spacing={scaled(0)}>
                <HStack
                  position="relative"
                  spacing={scaled(2)}
                  padding={scaled(2)}
                  color="gray.100"
                >
                  <Circle size={scaled(8)} background="yellow.400">
                    <Text
                      fontSize={scaled(16)}
                      fontWeight="bold"
                      color="yellow.800"
                    >
                      {you.bonusPoints}
                    </Text>
                  </Circle>
                  {(specialsCost || bonusFromSelectedCard) && (
                    <>
                      <ArrowForwardIcon width={scaled(8)} height={scaled(8)} />
                      <Circle size={scaled(8)} background="yellow.400">
                        <Text
                          fontSize={scaled(16)}
                          fontWeight="bold"
                          color="yellow.800"
                        >
                          {resultingBonusPoints}
                        </Text>
                      </Circle>
                    </>
                  )}
                </HStack>
                {selectedCard && (
                  <>
                    {[
                      { hotkey: "R", label: "Rotate" },
                      { hotkey: "E", label: "Mirror" },
                    ].map((s) => (
                      <HStack
                        key={s.label}
                        padding={scaled(2)}
                        color="gray.100"
                      >
                        <Kbd
                          borderColor="gray.100"
                          fontSize={scaled(20)}
                          userSelect="none"
                        >
                          <Text>{s.hotkey}</Text>
                        </Kbd>
                        <Text fontSize={scaled(16)} userSelect="none">
                          {s.label}
                        </Text>
                      </HStack>
                    ))}

                    <HStack
                      padding={scaled(2)}
                      borderRadius={scaled(10)}
                      borderWidth={scaled(2)}
                      color={
                        availableBonusPoints >= expandBuildRadiusByOne.cost
                          ? "gray.100"
                          : "gray.400"
                      }
                      opacity={
                        availableBonusPoints >= expandBuildRadiusByOne.cost
                          ? 1
                          : 0.5
                      }
                      background={
                        hasExpandBuildRaidusByOneActive
                          ? "green.500"
                          : "gray.700"
                      }
                      cursor="pointer"
                      onClick={() => {
                        if (
                          availableBonusPoints >= expandBuildRadiusByOne.cost
                        ) {
                          setSpecial(
                            "EXPAND_BUILD_RADIUS_BY_1",
                            !hasExpandBuildRaidusByOneActive
                          )
                        }
                      }}
                    >
                      <Circle size={scaled(8)} background="yellow.400">
                        <Text
                          fontSize={scaled(16)}
                          fontWeight="bold"
                          color="yellow.800"
                        >
                          {expandBuildRadiusByOne.cost}
                        </Text>
                      </Circle>
                      <Text fontSize={scaled(16)} userSelect="none">
                        +1 Reach
                      </Text>
                    </HStack>
                  </>
                )}
              </Stack>
            </Box>
          )}
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

          {activePlayer && (
            <UITurnChangeIndicator
              activePlayer={activePlayer}
              onChangingTurnsStart={() => {
                setIsChangingTurns(true)
              }}
              onChangingTurnsEnd={() => {
                setIsChangingTurns(false)
              }}
            />
          )}
        </>
      )}
      {/* <UILoggingView statusLog={[]} /> */}
      <UILoadingIndicator
        loading={/*!isLoadingMatch ||  isLoadingUpdate || */ isUpdatingMatch}
      />
    </Container>
  )
}

export default MatchView
