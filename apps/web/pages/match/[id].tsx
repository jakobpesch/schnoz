/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react"
import { Participant } from "database"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Coordinate } from "types"
// import popSound from "../../assets/sfx/pop.mp3"
import { MapControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { HoveredHighlights } from "../../components/map/HoveredHighlights"
import { UICardsView } from "../../components/ui/UICardsView"
import { UILoadingIndicator } from "../../components/ui/UILoadingIndicator"
import { UIPostMatchView } from "../../components/ui/UIPostMatchView"
import { UIPreMatchView } from "../../components/ui/UIPreMatchView"
import { UIScoreView, scaled } from "../../components/ui/UIScoreView"
import { UITurnChangeIndicator } from "../../components/ui/UITurnChangeIndicator"
import { UITurnTimer } from "../../components/ui/UITurnTimer"
import { UITurnsView } from "../../components/ui/UITurnsView"
import useAuth from "../../hooks/useAuth"
import { useMatchStatus } from "../../hooks/useMatchStatus"
import { createMap } from "../../services/MapService"
import {
  UpdateGameSettingsPayload,
  socketApi,
} from "../../services/SocketService"
import { setSelectedCard, useStore } from "../../store"
import { LAYERS, Terrains, Tiles, Units } from "../webgl"

const MatchView = () => {
  console.count("MatchView:rendered")

  const router = useRouter()
  const { profile } = useAuth()
  const userId = profile?.sub ?? ""
  const matchId = typeof router.query.id === "string" ? router.query.id : ""
  const toast = useToast()
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [isChangingTurns, setIsChangingTurns] = useState(false)

  const playSound = () => {
    // const audio = new Audio(popSound)
    // audio.play()
  }

  useEffect(() => {
    if (socketApi.IsConnected) {
      return
    }

    if (socketApi.IsConnecting) {
      return
    }

    if (!userId || !matchId) {
      return
    }
    setSelectedCard(null)
    socketApi.connectToMatch(userId, matchId)
    return () => {
      socketApi.disconnect()
    }
  }, [matchId, userId])

  const match = useStore((state) => state.match)
  const gameSettings = useStore((state) => state.gameSettings)
  const participants = useStore((state) => state.participants)
  const map = useStore((state) => state.map)
  const tilesWithUnits = useStore((state) => state.tilesWithUnits)

  const connectedParticipants = useStore((state) => state.connectedPlayers)

  const you = participants?.find((player) => player.userId === userId) ?? null

  const activePlayer =
    participants?.find((player) => player.id === match?.activePlayerId) ?? null
  const yourTurn = userId === activePlayer?.userId

  const [showRuleEvaluationHighlights, setShowRuleEvaluationHighlights] =
    useState<Coordinate[]>([])

  const { isPreMatch, wasStarted, isOngoing, isFinished } = useMatchStatus(
    match?.status,
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

  const handleStartGameClick = async () => {
    if (!userId) {
      return
    }

    try {
      setIsUpdatingMatch(true)
      if (!map) {
        const map = await createMap(match.id)
      }
      await socketApi.startMatch(userId)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdatingMatch(false)
    }
  }

  const handleSettingsChange = async (
    settings: Omit<UpdateGameSettingsPayload, "matchId">,
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

  return (
    <Box width="100vw" height="100vh" color="white">
      {isPreMatch && (
        <Container>
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
        </Container>
      )}
      {wasStarted && map && tilesWithUnits && activePlayer && (
        <>
          {
            //false && (
            //           <MapContainer
            //             id="map-container"
            //             map={map}
            //             bg="green"
            //             cursor={selectedCard ? "none" : "default"}
            //           >
            //             {isOngoing && /*!isLoadingMatch && */ !isUpdatingMatch && (
            //               <MapPlaceableTiles
            //                 placeableCoordinates={placeableCoordinates}
            //               />
            //             )}
            //
            //             <MapUnits
            //               unitTiles={unitTiles}
            //               players={participants}
            //               updatedUnitTiles={updatedTilesWithUnits ?? []}
            //             />
            //             {showRuleEvaluationHighlights && (
            //               <MapRuleEvaluations
            //                 coordinates={showRuleEvaluationHighlights}
            //               />
            //             )}
            //             <MapTerrains terrainTiles={terrainTiles} />
            //             <MapFog fogTiles={fogTiles} halfFogTiles={halfFogTiles} />
            //             {
            //               /*!isLoadingMatch && */ you &&
            //                 !isUpdatingMatch &&
            //                 !isChangingTurns && (
            //                   <MapHoveredHighlights
            //                     you={you}
            //                     activePlayer={activePlayer}
            //                     hide={isFinished}
            //                     specials={[expandBuildRadiusByOne]}
            //                     activeSpecials={activatedSpecials}
            //                     setSpecial={setSpecial}
            //                     card={selectedCard}
            //                     onTileClick={onTileClick}
            //                   />
            //                 )
            //             }
            //           </MapContainer>
            //        )
          }
          <Canvas
            orthographic
            camera={{
              position: [0, 0, LAYERS.CAMERA],
              zoom: 40,
              up: [0, 0, 1],
              far: 10000,
            }}
          >
            <ambientLight />
            <pointLight position={[0, 0, 10]} />
            <group position={[-map.colCount / 2, map.rowCount / 2, 0]}>
              <Tiles />
              <Units />
              <Terrains />
              {/* <PlaceableTiles placeableCoordinates={placeableCoordinates} /> */}
              <HoveredHighlights hide={isFinished} />

              <MapControls makeDefault zoomSpeed={0.5} enableRotate={true} />
            </group>
          </Canvas>
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
              {/* <Stack spacing={scaled(0)}>
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
                            !hasExpandBuildRaidusByOneActive,
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
              </Stack> */}
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
          <UICardsView />

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
    </Box>
  )
}

export default MatchView
