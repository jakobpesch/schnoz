/* eslint-disable react-hooks/exhaustive-deps */

import {
  Box,
  Button,
  Center,
  Container,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import { animated } from "@react-spring/three"
import { MapControls, useHelper } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Participant } from "database"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Animations } from "../../components/animations/Animations"
import { HoveredHighlights } from "../../components/map/HoveredHighlights"
import { PlaceableTiles } from "../../components/map/PlaceableTiles"
import { UICardsView } from "../../components/ui/UICardsView"
import { UILoadingIndicator } from "../../components/ui/UILoadingIndicator"
import { UIPostMatchView } from "../../components/ui/UIPostMatchView"
import { UIPreMatchView } from "../../components/ui/UIPreMatchView"
import { UIScoreView } from "../../components/ui/UIScoreView"
import { UISettingsView } from "../../components/ui/UISettingsView"
import { UISoundControls } from "../../components/ui/UISoundControls"
import { UITurnTimer } from "../../components/ui/UITurnTimer"
import { UITurnsView } from "../../components/ui/UITurnsView"
import { scaled } from "../../components/ui/rule-explainations.const"
import useAuth from "../../hooks/useAuth"
import { useMatchStatus } from "../../hooks/useMatchStatus"
import { useSound } from "../../providers/SoundProvider"
import { createMap } from "../../services/MapService"
import {
  UpdateGameSettingsPayload,
  socketApi,
} from "../../services/SocketService"
import {
  setConnectedParticipants,
  setFulfillments,
  setGameSettings,
  setHoveredCoordinate,
  setMap,
  setMatch,
  setOpponentsHoveredCoordinates,
  setParticipants,
  setPlaceableCoordinates,
  setSelectedCard,
  setShowRuleEvaluationHighlights,
  setTilesWithUnits,
  setUpdatedTilesWithUnits,
  useMatchStore,
} from "../../store"
import { LAYERS, Terrains, Tiles, Units } from "../webgl"
import { DirectionalLightHelper } from "three"

const CanvasContent = () => {
  const { playMusic, stopMusic } = useSound()
  const map = useMatchStore((state) => state.map)
  const directionalLighRef = useRef<THREE.DirectionalLight>(null!)

  useEffect(() => {
    playMusic("music2")
    return () => {
      stopMusic()
    }
  }, [])
  useHelper(directionalLighRef, DirectionalLightHelper, 1, "red")

  useFrame(({ clock }) => {
    if (!directionalLighRef.current) {
      return
    }
    const elapsedTime = clock.getElapsedTime()
    const radius = 10
    const time = 10
    const baseIntensity = 5
    const deltaIntensity = 0
    // Calculate new position in a haf circle
    const x = Math.cos(elapsedTime / time) * radius
    const y = Math.abs(Math.sin(elapsedTime / time) * radius)
    const z = Math.abs(
      Math.sin(elapsedTime / time) * (radius + LAYERS.LIGHTING),
    )
    const intensity =
      Math.abs(Math.sin(elapsedTime / time) * deltaIntensity) + baseIntensity

    directionalLighRef.current.position.set(x, 5, LAYERS.LIGHTING - 10)
    directionalLighRef.current.intensity = intensity
  })

  if (!map) {
    return null
  }

  return (
    <>
      <animated.ambientLight intensity={0.5}></animated.ambientLight>
      <animated.directionalLight
        castShadow
        ref={directionalLighRef}
        color={"white"}
      >
        <mesh>
          {/* <planeGeometry args={[1, 1]} /> */}
          {/* <sphereGeometry args={[1, 64, 64]} /> */}
        </mesh>
      </animated.directionalLight>

      <group position={[-map.colCount / 2 + 0.5, map.rowCount / 2 - 0.5, 0]}>
        <group
          position={[map.colCount / 2 - 0.5, -map.colCount / 2 + 0.5, 0.2]}
          // rotation={[-0.8, 0, 0.8]}
        >
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.4]} />
            <meshStandardMaterial color={"royalblue"} />
          </mesh>
          <mesh
            position={[0, 0, 0.3]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[0.422, 0.2]} />
            <meshStandardMaterial color={"royalblue"} />
          </mesh>
        </group>
        <Animations />
        <Tiles />
        <Units />
        <Terrains />
        <PlaceableTiles />
        <HoveredHighlights hide={false} />
        <MapControls
          makeDefault
          zoomSpeed={0.5}
          enableRotate={true}
          zoomToCursor
        />
      </group>
    </>
  )
}

const MatchView = () => {
  const router = useRouter()
  const { profile } = useAuth()
  const userId = profile?.sub ?? ""
  const matchId = typeof router.query.id === "string" ? router.query.id : ""
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)

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
      setMatch(null)
      setMap(null)
      setIsUpdatingMatch(false)
      setTilesWithUnits(null)
      setUpdatedTilesWithUnits(null)
      setSelectedCard(null)
      setGameSettings(null)
      setPlaceableCoordinates(null)
      setHoveredCoordinate(null)
      setParticipants(null)
      setFulfillments(null)
      setConnectedParticipants(null)
      setOpponentsHoveredCoordinates(null)
      setShowRuleEvaluationHighlights(null)
    }
  }, [matchId, userId])

  const match = useMatchStore((state) => state.match)
  const gameSettings = useMatchStore((state) => state.gameSettings)
  const participants = useMatchStore((state) => state.participants)
  const map = useMatchStore((state) => state.map)
  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)

  const connectedParticipants = useMatchStore(
    (state) => state.connectedParticipants,
  )

  const you = participants?.find((player) => player.userId === userId) ?? null

  const activePlayer =
    participants?.find((player) => player.id === match?.activePlayerId) ?? null

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
          <Canvas
            id="match-canvas"
            orthographic
            color="red"
            shadows
            camera={{
              position: [0, 0, LAYERS.CAMERA],
              zoom: 100,
              up: [0, 0, 1],
              far: 10000,
              onUpdate() {
                console.log("update")
              },
            }}
          >
            <CanvasContent />
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
          <UIScoreView />
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
          <UITurnsView />
          {/* {you?.bonusPoints != null && (
            <UIBonusPointsView bonusPoints={you.bonusPoints} />
          )} */}
          <UICardsView />

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
      {/* <UILoggingView statusLog={[]} /> */}
      <UILoadingIndicator
        loading={/*!isLoadingMatch ||  isLoadingUpdate || */ isUpdatingMatch}
      />
      <HStack position="fixed" bottom="4" right="4">
        <UISettingsView />
        <UISoundControls />
      </HStack>
    </Box>
  )
}

export default MatchView
