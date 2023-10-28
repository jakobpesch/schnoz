import { Box, Flex, Stack, Text } from "@chakra-ui/react"
import { getSquareMatrix } from "coordinate-utils"
import { Rule, Terrain } from "database"
import Image from "next/image"
import { ReactNode } from "react"
import { RenderSettings } from "../../services/SettingsService"
export const scaled = (value: number) => value * RenderSettings.uiScale
export const ruleExplainations = new Map<Rule, ReactNode>([
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
                    priority
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
                    priority
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
                    priority
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
                    priority
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
                    priority
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
                    priority
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
