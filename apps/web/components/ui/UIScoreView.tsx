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
import { GameSettings, Participant, Rule, Terrain } from "database"
import assert from "assert"
import { NotAllowedIcon } from "@chakra-ui/icons"
import Image from "next/image"
import { ReactNode } from "react"
import { createCustomGame } from "../../gameLogic/GameVariants"
import { RuleEvaluation } from "../../gameLogic/ScoringRule"
import { Coordinate2D } from "../../models/UnitConstellation.model"
import { RenderSettings } from "../../services/SettingsService"
import { MapWithTiles } from "../../types/Map"
import { TileWithUnit } from "../../types/Tile"
import { getSquareMatrix, getTileLookup } from "../../utils/coordinateUtils"
import { HoveredTooltip } from "../HoveredTooltip"

export const viewFactorWidth = (
  value: number,
  viewPortWidthFactor: number = 0.1
) => viewPortWidthFactor * value + "vmin"

const getEvaluationsMap = (
  tilesWithUnits: TileWithUnit[],
  players: Participant[],
  rules: GameSettings["rules"]
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
      gameType.scoringRules.map((rule) => rule(player.id, tileLookup))
    )
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
        <Stack width={viewFactorWidth((radius * 2 + 1) * size)}>
          <Text fontSize={viewFactorWidth(20)}>
            Gain a rule point for each water tile that is touched by at least
            one of your units.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={viewFactorWidth(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.TERRAIN_WATER_POSITIVE + coordinate}
                minWidth={viewFactorWidth(size)}
                minHeight={viewFactorWidth(size)}
                maxWidth={viewFactorWidth(size)}
                maxHeight={viewFactorWidth(size)}
                bg={index % 2 === 0 ? "green.800" : "green.900"}
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Image src={RenderSettings.getPlayerAppearance(0).unit} />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image src={terrain} width="100%" height="100%" />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={viewFactorWidth(25)}
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
        <Stack width={viewFactorWidth((radius * 2 + 1) * size)}>
          <Text fontSize={viewFactorWidth(20)}>
            Lose a rule point for each stone tile that is touched by at least
            one of your units.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={viewFactorWidth(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.TERRAIN_STONE_NEGATIVE + coordinate}
                minWidth={viewFactorWidth(size)}
                minHeight={viewFactorWidth(size)}
                maxWidth={viewFactorWidth(size)}
                maxHeight={viewFactorWidth(size)}
                bg={index % 2 === 0 ? "green.800" : "green.900"}
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Image src={RenderSettings.getPlayerAppearance(0).unit} />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image src={terrain} width="100%" height="100%" />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={viewFactorWidth(25)}
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
        <Stack width={viewFactorWidth((radius * 2 + 1) * size)}>
          <Text fontSize={viewFactorWidth(20)}>
            Gain a rule point for each tile, that is only surrounded by allied
            units or terrain.
          </Text>
          <Text
            fontSize={viewFactorWidth(10)}
            fontStyle="italic"
            color="gray.400"
          >
            The main building in the center of the map counts as an allied unit.
            Also, the boundaries of the map make it easier to form holes.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={viewFactorWidth(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.HOLE + coordinate}
                minWidth={viewFactorWidth(size)}
                minHeight={viewFactorWidth(size)}
                maxWidth={viewFactorWidth(size)}
                maxHeight={viewFactorWidth(size)}
                bg={index % 2 === 0 ? "green.800" : "green.900"}
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Image src={RenderSettings.getPlayerAppearance(0).unit} />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Image src={RenderSettings.getPlayerAppearance(1).unit} />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Image src={RenderSettings.getPlayerAppearance().unit} />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image src={terrain} width="100%" height="100%" />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={viewFactorWidth(25)}
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
        <Stack width={viewFactorWidth((radius * 2 + 1) * size)}>
          <Text fontSize={viewFactorWidth(20)}>
            Gain a rule point for every diagonal from bottom-left to the
            top-right that constists of at least three units.
          </Text>
          <Text
            fontSize={viewFactorWidth(10)}
            fontStyle="italic"
            color="gray.400"
          >
            Note: Diagonals that go from the top-left to the bottom-right do not
            count! Also, extending the diagonal to four or more units does not
            give more points.
          </Text>
          <Flex
            overflow="hidden"
            flexWrap="wrap"
            position="relative"
            borderRadius={viewFactorWidth(10)}
          >
            {getSquareMatrix(radius).map((coordinate, index) => (
              <Box
                key={"tut_map_" + Rule.DIAGONAL_NORTHEAST + coordinate}
                minWidth={viewFactorWidth(size)}
                minHeight={viewFactorWidth(size)}
                maxWidth={viewFactorWidth(size)}
                maxHeight={viewFactorWidth(size)}
                bg={index % 2 === 0 ? "green.800" : "green.900"}
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Image src={RenderSettings.getPlayerAppearance(0).unit} />
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  {terrain && (
                    <Image src={terrain} width="100%" height="100%" />
                  )}
                </Flex>
              )
            })}
            <Flex
              position="absolute"
              align="center"
              justify="center"
              top={viewFactorWidth(0.5 * size)}
              left={viewFactorWidth(0.5 * size)}
              width={viewFactorWidth(
                Math.sqrt((2 * size) ** 2 + (2 * size) ** 2)
              )}
              height={viewFactorWidth(3 * size)}
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
              top={viewFactorWidth(1.5 * size)}
              left={viewFactorWidth(0.5 * size)}
              width={viewFactorWidth(
                Math.sqrt((3 * size) ** 2 + (3 * size) ** 2)
              )}
              height={viewFactorWidth(3 * size)}
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
                  top={viewFactorWidth(row * size)}
                  left={viewFactorWidth(col * size)}
                  width={viewFactorWidth(size)}
                  height={viewFactorWidth(size)}
                  pointerEvents="none"
                >
                  <Text
                    textShadow="1px 1px 0px black,-1px -1px 0px black,1px -1px 0px black,-1px 1px 0px black;"
                    fontSize={viewFactorWidth(25)}
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
  onRuleHover: (coordinates: Coordinate2D[]) => void
}) => {
  const player1 = props.participants.find((player) => player.playerNumber === 0)
  assert(player1)

  const player2 = props.participants.find((player) => player.playerNumber === 1)
  assert(player2)

  const rulesMap = props.tilesWithUnits
    ? getEvaluationsMap(props.tilesWithUnits, props.participants, props.rules)
    : null
  const player1Connected = props.connectedParticipants.find(
    (p) => player1.id === p.id
  )
  const player2Connected = props.connectedParticipants.find(
    (p) => player2.id === p.id
  )
  return (
    <VStack position="fixed" top="0" right="0">
      <VStack
        bg="gray.700"
        borderWidth={viewFactorWidth(1)}
        borderRadius={viewFactorWidth(10)}
        spacing={viewFactorWidth(10)}
        p={viewFactorWidth(10)}
        m={viewFactorWidth(10)}
      >
        <HStack spacing={viewFactorWidth(16)}>
          <Flex
            key={player1.id}
            align="center"
            justify="center"
            gap={viewFactorWidth(16)}
          >
            <Box position="relative">
              <Image
                src={
                  RenderSettings.getPlayerAppearance(player1.playerNumber).unit
                }
                width={viewFactorWidth(300)}
                height={viewFactorWidth(300)}
              />
              {!player1Connected && (
                <NotAllowedIcon
                  position="absolute"
                  left="0"
                  top="0"
                  color="red"
                  boxSize={viewFactorWidth(45)}
                />
              )}
            </Box>
            <Heading fontSize={viewFactorWidth(25)}>{player1.score}</Heading>
          </Flex>
          <Divider orientation="vertical"></Divider>
          <Flex
            key={player2.id}
            align="center"
            justify="center"
            gap={viewFactorWidth(16)}
          >
            <Heading fontSize={viewFactorWidth(25)}>{player2.score}</Heading>
            <Box position="relative">
              <Image
                src={
                  RenderSettings.getPlayerAppearance(player2.playerNumber).unit
                }
                width={viewFactorWidth(300)}
                height={viewFactorWidth(300)}
              />
              {!player2Connected && (
                <NotAllowedIcon
                  position="absolute"
                  left="0"
                  top="0"
                  color="red"
                  boxSize={viewFactorWidth(45)}
                />
              )}
            </Box>
          </Flex>
        </HStack>
        <Divider />
        {rulesMap && (
          <Stack spacing={viewFactorWidth(5)} width="full">
            {Array.from(rulesMap.values()).map(
              (ruleEvaluations, ruleEvalsIndex) => {
                return (
                  <VStack
                    key={"ruleEvals_" + ruleEvalsIndex}
                    p={viewFactorWidth(5)}
                    borderRadius={viewFactorWidth(10)}
                    bg={
                      ruleEvaluations[0].points === ruleEvaluations[1].points
                        ? "none"
                        : ruleEvaluations[0].points > ruleEvaluations[1].points
                        ? RenderSettings.getPlayerAppearance(
                            player1.playerNumber
                          ).color
                        : RenderSettings.getPlayerAppearance(
                            player2.playerNumber
                          ).color
                    }
                  >
                    <Flex
                      gap={viewFactorWidth(16)}
                      align="center"
                      justify="space-around"
                      width="full"
                      color="white"
                    >
                      <Heading
                        minWidth={viewFactorWidth(30)}
                        textAlign="center"
                        cursor="default"
                        fontSize={viewFactorWidth(25)}
                        size="md"
                        onMouseEnter={() =>
                          props.onRuleHover(
                            ruleEvaluations[0].fulfillments.flat()
                          )
                        }
                        onMouseLeave={() => props.onRuleHover([])}
                      >
                        {ruleEvaluations[0].points}
                      </Heading>
                      <HoveredTooltip
                        trigger={
                          <Image
                            src={RenderSettings.getRuleAppearance(
                              ruleEvaluations[0].type
                            )}
                            width={viewFactorWidth(300)}
                            height={viewFactorWidth(300)}
                          />
                        }
                        header={
                          <HStack>
                            <Box
                              minWidth={viewFactorWidth(40)}
                              minHeight={viewFactorWidth(40)}
                              width={viewFactorWidth(40)}
                              height={viewFactorWidth(40)}
                            >
                              <Image
                                src={RenderSettings.getRuleAppearance(
                                  ruleEvaluations[0].type
                                )}
                              />
                            </Box>
                            <Heading fontSize={viewFactorWidth(25)}>
                              {RenderSettings.getRuleName(
                                ruleEvaluations[0].type
                              )}
                            </Heading>
                          </HStack>
                        }
                        body={ruleExplainations.get(ruleEvaluations[0].type)}
                      />

                      <Heading
                        minWidth={viewFactorWidth(30)}
                        textAlign="center"
                        cursor="default"
                        fontSize={viewFactorWidth(25)}
                        size="md"
                        onMouseEnter={() =>
                          props.onRuleHover(
                            ruleEvaluations[1].fulfillments.flat()
                          )
                        }
                        onMouseLeave={() => props.onRuleHover([])}
                      >
                        {ruleEvaluations[1].points}
                      </Heading>
                    </Flex>
                  </VStack>
                )
              }
            )}
          </Stack>
        )}
      </VStack>
    </VStack>
  )
}
