import { NotAllowedIcon } from "@chakra-ui/icons"
import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import assert from "assert"
import { getSquareMatrix, getTileLookup } from "coordinate-utils"
import { GameSettings, Participant, Rule, Terrain } from "database"
import { createCustomGame } from "game-logic"
import Image from "next/image"
import { ReactNode } from "react"
import { RuleEvaluation, TileWithUnit } from "types"
import { RenderSettings } from "../../services/SettingsService"
import { setShowRuleEvaluationHighlights } from "../../store"
import { HoveredTooltip } from "../HoveredTooltip"

export const scaled = (value: number) => value * RenderSettings.uiScale

const getEvaluationsMap = (
  tilesWithUnits: TileWithUnit[],
  players: Participant[],
  rules: GameSettings["rules"],
) => {
  const tileLookup = getTileLookup(tilesWithUnits)
  const rulesMap = new Map<Rule, RuleEvaluation[]>()
  const gameType = createCustomGame(rules)
  gameType.scoringRules.forEach((rule) => {
    const evals = players
      .sort((a, b) => a.playerNumber - b.playerNumber)
      .map((player) => rule(player.id, tileLookup))
    rulesMap.set(evals[0].type, evals)
  })
  const evaluationsMap = new Map<string, RuleEvaluation[]>()
  players.forEach((player) =>
    evaluationsMap.set(
      player.id,
      gameType.scoringRules.map((rule) => rule(player.id, tileLookup)),
    ),
  )

  return rulesMap
}

const ruleExplainations = new Map<Rule, ReactNode>([
  [
    "TERRAIN_WATER_POSITIVE",
    (() => {
      const size = 50
      const radius = 2
      return (
        <Stack width={scaled((radius * 2 + 1) * size)}>
          <Text fontSize={scaled(20)}>
            Gain a rule point for each water tile that is touched by at least
            one of your units.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={scaled(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.TERRAIN_WATER_POSITIVE + coordinate}
                minWidth={scaled(size)}
                minHeight={scaled(size)}
                maxWidth={scaled(size)}
                maxHeight={scaled(size)}
                background={index % 2 === 0 ? "green.800" : "green.900"}
              />
            ))}
            {[
              [1, 0],
              [3, 3],
              [3, 1],
              [0, 4],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={
                    "tut_map_player0" +
                    Rule.TERRAIN_WATER_POSITIVE +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Image
                    alt=""
                    src={RenderSettings.getPlayerAppearance(0).unit}
                  />
                </Flex>
              )
            })}
            {[
              [1, 1],
              [1, 3],
              [3, 2],
            ].map(([row, col]) => {
              const terrain = RenderSettings.getTerrainAppearance(Terrain.WATER)
              return (
                <Flex
                  key={
                    "tut_map_terrainWater" +
                    Rule.TERRAIN_WATER_POSITIVE +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image
                      alt=""
                      src={terrain}
                      width={scaled(size)}
                      height={scaled(size)}
                    />
                  )}
                </Flex>
              )
            })}
            {[
              [1, 1],
              [3, 2],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={
                    "tut_map_star" +
                    Rule.TERRAIN_WATER_POSITIVE +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="start"
                  justify="end"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={scaled(25)}
                  >
                    ⭐️
                  </Text>
                </Flex>
              )
            })}
          </Flex>
        </Stack>
      )
    })(),
  ],
  [
    "TERRAIN_STONE_NEGATIVE",
    (() => {
      const size = 50
      const radius = 2
      return (
        <Stack width={scaled((radius * 2 + 1) * size)}>
          <Text fontSize={scaled(20)}>
            Lose a rule point for each stone tile that is touched by at least
            one of your units.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={scaled(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.TERRAIN_STONE_NEGATIVE + coordinate}
                minWidth={scaled(size)}
                minHeight={scaled(size)}
                maxWidth={scaled(size)}
                maxHeight={scaled(size)}
                background={index % 2 === 0 ? "green.800" : "green.900"}
              />
            ))}
            {[
              [1, 0],
              [3, 3],
              [3, 1],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={
                    "tut_map_player0" +
                    Rule.TERRAIN_STONE_NEGATIVE +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Image
                    alt=""
                    src={RenderSettings.getPlayerAppearance(0).unit}
                  />
                </Flex>
              )
            })}
            {[
              [1, 1],
              [1, 3],
              [3, 2],
            ].map(([row, col]) => {
              const terrain = RenderSettings.getTerrainAppearance(Terrain.STONE)
              return (
                <Flex
                  key={row + "_" + col}
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image
                      alt=""
                      src={terrain}
                      width={scaled(size)}
                      height={scaled(size)}
                    />
                  )}
                </Flex>
              )
            })}
            {[
              [1, 1],
              [3, 2],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={
                    "tut_map_shit" +
                    Rule.TERRAIN_STONE_NEGATIVE +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="start"
                  justify="end"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={scaled(25)}
                  >
                    💩
                  </Text>
                </Flex>
              )
            })}
          </Flex>
        </Stack>
      )
    })(),
  ],
  [
    "HOLE",
    (() => {
      const size = 50
      const radius = 2
      return (
        <Stack width={scaled((radius * 2 + 1) * size)}>
          <Text fontSize={scaled(20)}>
            Gain a rule point for each tile, that is only surrounded by allied
            units or terrain.
          </Text>
          <Text fontSize={scaled(10)} fontStyle="italic" color="gray.400">
            The main building in the center of the map counts as an allied unit.
            Also, the boundaries of the map make it easier to form holes.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={scaled(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.HOLE + coordinate}
                minWidth={scaled(size)}
                minHeight={scaled(size)}
                maxWidth={scaled(size)}
                maxHeight={scaled(size)}
                background={index % 2 === 0 ? "green.800" : "green.900"}
              />
            ))}
            {[
              [1, 0],
              [0, 1],
              [1, 2],
              [2, 1],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={"tut_map_player0" + Rule.HOLE + row + "_" + col}
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Image
                    alt=""
                    src={RenderSettings.getPlayerAppearance(0).unit}
                  />
                </Flex>
              )
            })}
            {[
              [0, 4],
              [1, 4],
              [0, 3],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={"tut_map_player1" + Rule.HOLE + row + "_" + col}
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Image
                    alt=""
                    src={RenderSettings.getPlayerAppearance(1).unit}
                  />
                </Flex>
              )
            })}
            {[[3, 2]].map(([row, col]) => {
              return (
                <Flex
                  key={"tut_map_mainBuilding" + Rule.HOLE + row + "_" + col}
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Image
                    alt=""
                    src={RenderSettings.getPlayerAppearance().unit}
                  />
                </Flex>
              )
            })}
            {[[2, 3]].map(([row, col]) => {
              const terrain = RenderSettings.getTerrainAppearance(Terrain.TREE)
              return (
                <Flex
                  key={"tut_map_terrainTREE" + Rule.HOLE + row + "_" + col}
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image
                      alt=""
                      src={terrain}
                      width={scaled(size)}
                      height={scaled(size)}
                    />
                  )}
                </Flex>
              )
            })}
            {[
              [0, 0],
              [1, 1],
              [2, 2],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={"tut_map_star" + Rule.HOLE + row + "_" + col}
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={scaled(25)}
                  >
                    ⭐️
                  </Text>
                </Flex>
              )
            })}
          </Flex>
        </Stack>
      )
    })(),
  ],
  [
    "DIAGONAL_NORTHEAST",
    (() => {
      const size = 50
      const radius = 2
      return (
        <Stack width={scaled((radius * 2 + 1) * size)}>
          <Text fontSize={scaled(20)}>
            Gain a rule point for every diagonal from bottom-left to the
            top-right that constists of at least three units.
          </Text>
          <Text fontSize={scaled(10)} fontStyle="italic" color="gray.400">
            Note: Diagonals that go from the top-left to the bottom-right do not
            count! Also, extending the diagonal to four or more units does not
            give more points.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={scaled(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.DIAGONAL_NORTHEAST + coordinate}
                minWidth={scaled(size)}
                minHeight={scaled(size)}
                maxWidth={scaled(size)}
                maxHeight={scaled(size)}
                background={index % 2 === 0 ? "green.800" : "green.900"}
              />
            ))}
            {[
              [0, 0],
              [1, 1],

              [3, 0],
              [2, 1],
              [1, 2],

              [4, 0],
              [3, 1],
              [2, 2],
              [1, 3],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={
                    "tut_map_player0" +
                    Rule.DIAGONAL_NORTHEAST +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Image
                    alt=""
                    src={RenderSettings.getPlayerAppearance(0).unit}
                  />
                </Flex>
              )
            })}
            {[[2, 3]].map(([row, col]) => {
              const terrain = RenderSettings.getTerrainAppearance(Terrain.TREE)
              return (
                <Flex
                  key={
                    "tut_map_terrainTree" +
                    Rule.DIAGONAL_NORTHEAST +
                    row +
                    "_" +
                    col
                  }
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image
                      alt=""
                      src={terrain}
                      width={scaled(size)}
                      height={scaled(size)}
                    />
                  )}
                </Flex>
              )
            })}
            <Flex
              position="absolute"
              align="center"
              justify="center"
              top={scaled(0.5 * size)}
              left={scaled(0.5 * size)}
              width={scaled(Math.sqrt((2 * size) ** 2 + (2 * size) ** 2))}
              height={scaled(3 * size)}
              borderBottomWidth="5px"
              borderColor="yellow.300"
              transform={"rotate(-45deg)"}
              transformOrigin="left bottom"
              pointerEvents="none"
            />
            <Flex
              position="absolute"
              align="center"
              justify="center"
              top={scaled(1.5 * size)}
              left={scaled(0.5 * size)}
              width={scaled(Math.sqrt((3 * size) ** 2 + (3 * size) ** 2))}
              height={scaled(3 * size)}
              borderBottomWidth="5px"
              borderColor="yellow.300"
              transform={"rotate(-45deg)"}
              transformOrigin="left bottom"
              pointerEvents="none"
            />
            {[
              [2, 1],
              [2.5, 1.5],
            ].map(([row, col]) => {
              return (
                <Flex
                  key={
                    "tut_map_star" + Rule.DIAGONAL_NORTHEAST + row + "_" + col
                  }
                  position="absolute"
                  align="center"
                  justify="center"
                  top={scaled(row * size)}
                  left={scaled(col * size)}
                  width={scaled(size)}
                  height={scaled(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={scaled(25)}
                  >
                    ⭐️
                  </Text>
                </Flex>
              )
            })}
          </Flex>
        </Stack>
      )
    })(),
  ],
])

export const UIScoreView = (props: {
  participants: Participant[]
  connectedParticipants: Participant[]
  tilesWithUnits: TileWithUnit[]
  rules: GameSettings["rules"]
}) => {
  const player1 = props.participants.find((player) => player.playerNumber === 0)
  assert(player1)

  const player2 = props.participants.find((player) => player.playerNumber === 1)
  assert(player2)

  const rulesMap = props.tilesWithUnits
    ? getEvaluationsMap(props.tilesWithUnits, props.participants, props.rules)
    : null
  const player1Connected = props.connectedParticipants.find(
    (p) => player1.id === p.id,
  )
  const player2Connected = props.connectedParticipants.find(
    (p) => player2.id === p.id,
  )
  return (
    <VStack position="fixed" top="0" right="0">
      <VStack
        background="gray.700"
        borderWidth={scaled(1)}
        borderRadius={scaled(10)}
        spacing={scaled(4)}
        padding={scaled(1)}
        margin={scaled(4)}
      >
        <HStack spacing={scaled(4)}>
          <Flex
            key={player1.id}
            align="center"
            justify="center"
            gap={scaled(4)}
          >
            <Box position="relative">
              <Image
                alt=""
                src={
                  RenderSettings.getPlayerAppearance(player1.playerNumber).unit
                }
                width={scaled(50)}
                height={scaled(50)}
              />
              {!player1Connected && (
                <NotAllowedIcon
                  position="absolute"
                  left="0"
                  top="0"
                  color="red"
                  boxSize={scaled(50)}
                />
              )}
            </Box>
            <Heading fontSize={scaled(30)}>{player1.score}</Heading>
          </Flex>
          <Divider orientation="vertical"></Divider>
          <Flex
            key={player2.id}
            align="center"
            justify="center"
            gap={scaled(4)}
          >
            <Heading fontSize={scaled(30)}>{player2.score}</Heading>
            <Box position="relative">
              <Image
                alt=""
                src={
                  RenderSettings.getPlayerAppearance(player2.playerNumber).unit
                }
                width={scaled(50)}
                height={scaled(50)}
              />
              {!player2Connected && (
                <NotAllowedIcon
                  position="absolute"
                  left="0"
                  top="0"
                  color="red"
                  boxSize={scaled(50)}
                />
              )}
            </Box>
          </Flex>
        </HStack>
        <Divider />
        {rulesMap && (
          <Stack spacing={scaled(2)} width="full">
            {Array.from(rulesMap.values()).map(
              (ruleEvaluations, ruleEvalsIndex) => {
                return (
                  <VStack
                    key={"ruleEvals_" + ruleEvalsIndex}
                    padding={scaled(1)}
                    borderRadius={scaled(10)}
                    background={
                      ruleEvaluations[0].points === ruleEvaluations[1].points
                        ? "none"
                        : ruleEvaluations[0].points > ruleEvaluations[1].points
                        ? RenderSettings.getPlayerAppearance(
                            player1.playerNumber,
                          ).color
                        : RenderSettings.getPlayerAppearance(
                            player2.playerNumber,
                          ).color
                    }
                  >
                    <Flex
                      gap={scaled(2)}
                      align="center"
                      justify="space-around"
                      width="full"
                      color="white"
                    >
                      <Heading
                        minWidth={scaled(30)}
                        rounded={scaled(8)}
                        _hover={{
                          bg: "whiteAlpha.300",
                        }}
                        textAlign="center"
                        cursor="default"
                        fontSize={scaled(30)}
                        size="md"
                        onMouseEnter={() =>
                          setShowRuleEvaluationHighlights(
                            ruleEvaluations[0].fulfillments.flat(),
                          )
                        }
                        onMouseLeave={() => setShowRuleEvaluationHighlights([])}
                      >
                        {ruleEvaluations[0].points}
                      </Heading>
                      <HoveredTooltip
                        trigger={
                          <Image
                            alt=""
                            src={RenderSettings.getRuleAppearance(
                              ruleEvaluations[0].type,
                            )}
                            width={scaled(40)}
                            height={scaled(40)}
                          />
                        }
                        header={
                          <HStack>
                            <Image
                              alt=""
                              src={RenderSettings.getRuleAppearance(
                                ruleEvaluations[0].type,
                              )}
                              width={scaled(40)}
                              height={scaled(40)}
                            />

                            <Heading fontSize={scaled(25)}>
                              {RenderSettings.getRuleName(
                                ruleEvaluations[0].type,
                              )}
                            </Heading>
                          </HStack>
                        }
                        body={ruleExplainations.get(ruleEvaluations[0].type)}
                      />

                      <Heading
                        minWidth={scaled(30)}
                        rounded={scaled(8)}
                        _hover={{
                          bg: "whiteAlpha.300",
                        }}
                        textAlign="center"
                        cursor="default"
                        fontSize={scaled(25)}
                        size="md"
                        onMouseEnter={() =>
                          setShowRuleEvaluationHighlights(
                            ruleEvaluations[1].fulfillments.flat(),
                          )
                        }
                        onMouseLeave={() => setShowRuleEvaluationHighlights([])}
                      >
                        {ruleEvaluations[1].points}
                      </Heading>
                    </Flex>
                  </VStack>
                )
              },
            )}
          </Stack>
        )}
      </VStack>
    </VStack>
  )
}
