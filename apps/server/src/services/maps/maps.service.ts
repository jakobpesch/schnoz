import { Injectable, NotFoundException } from "@nestjs/common"
import { GameSettings, Map, Match, Prisma, Terrain, User } from "database"
import { PrismaService } from "../prisma/prisma.service"
import { API_ERROR_CODES, Coordinate } from "types"
import {
  coordinateIncludedIn,
  getCoordinateCircle,
  translateCoordinatesTo,
} from "coordinate-utils"
import { MatchesService } from "../matches/matches.service"

const getRandomTerrain = (gameSettings: GameSettings) => {
  const nullProbability = 30
  const waterProbability = gameSettings.waterRatio
  const treeProbability = gameSettings.treeRatio
  const stoneProbability = gameSettings.stoneRatio

  const probabilityArray: (Terrain | null)[] = [
    ...Array(nullProbability).fill(null),
    ...Array(waterProbability).fill(Terrain.WATER),
    ...Array(treeProbability).fill(Terrain.TREE),
    ...Array(stoneProbability).fill(Terrain.STONE),
  ]

  const randomNumber = Math.random()
  const threshold = 1 / probabilityArray.length
  for (let i = 0; i < probabilityArray.length; i++) {
    if (randomNumber < i * threshold) {
      return probabilityArray[i]
    }
  }
  return null
}
const getInitialiseMapPayload = (gameSettings: GameSettings) => {
  const halfMapSize = Math.floor(gameSettings.mapSize / 2)
  const centerCoordinate: Coordinate = [halfMapSize, halfMapSize]

  const initialVisionRadius = 3
  const initialVision = translateCoordinatesTo(
    centerCoordinate,
    getCoordinateCircle(initialVisionRadius),
  )

  const saveAreaRadius = 2
  const safeArea = translateCoordinatesTo(
    centerCoordinate,
    getCoordinateCircle(saveAreaRadius),
  )

  const tilesCreatePayload: Prisma.TileCreateManyMapInput[] = []
  const indices = [...Array(gameSettings.mapSize).keys()]

  indices.forEach((row) => {
    indices.forEach((col) => {
      const coordinate: Coordinate = [row, col]

      const tilePayload: Prisma.TileCreateManyMapInput = {
        row,
        col,
      }

      if (!coordinateIncludedIn(safeArea, coordinate)) {
        tilePayload.terrain = getRandomTerrain(gameSettings)
      }

      if (coordinateIncludedIn(initialVision, coordinate)) {
        tilePayload.visible = true
      }

      //   if (coordinatesAreEqual(coordinate, centerCoordinate)) {
      //     tilePayload.unit = {
      //       create: { type: UnitType.MAIN_BUILDING },
      //     }
      //   }

      tilesCreatePayload.push(tilePayload)
    })
  })

  return {
    rowCount: gameSettings.mapSize,
    colCount: gameSettings.mapSize,
    tiles: tilesCreatePayload,
  }
}

@Injectable()
export class MapsService {
  constructor(
    private prisma: PrismaService,
    private readonly matchesService: MatchesService,
  ) {}

  async findOne(mapWhereUniqueInput: Prisma.MapWhereUniqueInput) {
    const map = await this.prisma.map.findUnique({
      where: mapWhereUniqueInput,
    })

    if (!map) {
      throw new NotFoundException()
    }
    return map
  }

  async findMany(params: {
    skip?: number
    take?: number
    cursor?: Prisma.MapWhereUniqueInput
    where?: Prisma.MapWhereInput
    orderBy?: Prisma.MapOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.map.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async create(data: { userId: User["id"]; matchId: Match["id"] }) {
    const { userId, matchId } = data

    const match = await this.matchesService.findOneRich({
      id: matchId,
    })

    if (match === null) {
      throw new NotFoundException(API_ERROR_CODES.MATCH_NOT_FOUND)
    }
    if (match.map) {
      throw new NotFoundException(API_ERROR_CODES.MATCH_ALREADY_HAS_MAP)
    }
    if (match.createdById !== userId) {
      throw new NotFoundException(API_ERROR_CODES.ONLY_HOST_CAN_CREATE_MAP)
    }
    if (!match.gameSettings) {
      throw new NotFoundException(API_ERROR_CODES.GAME_SETTINGS_NOT_FOUND)
    }

    const { colCount, rowCount, tiles } = getInitialiseMapPayload(
      match.gameSettings,
    )
    const halfMapSize = Math.floor(match.gameSettings.mapSize / 2)
    const map = await this.prisma.$transaction(async (tx) => {
      const map = await tx.map.create({
        data: {
          match: {
            connect: {
              id: matchId,
            },
          },
          rowCount,
          colCount,
          tiles: {
            createMany: {
              data: tiles,
            },
          },
        },
      })
      await tx.tile.update({
        where: {
          mapId_row_col: {
            mapId: map.id,
            row: halfMapSize,
            col: halfMapSize,
          },
        },
        data: {
          unit: { create: { type: "MAIN_BUILDING" } },
        },
      })
      const updatedTiles = await tx.tile.findMany({
        where: { mapId: map.id },
        select: {
          row: true,
          visible: true,
          col: true,
          terrain: true,
          unit: true,
        },
      })
      await tx.matchLog.createMany({
        data: [
          {
            matchId: match.id,
            message: "Map created",
            data: JSON.stringify(map),
          },
          {
            matchId: match.id,
            message: "Tiles created",
            data: JSON.stringify(updatedTiles),
          },
        ],
      })
      return map
    })

    return map
  }

  async update(params: {
    where: Prisma.MapWhereUniqueInput
    data: Prisma.MapUncheckedUpdateInput
  }) {
    const { where, data } = params
    return this.prisma.map.update({
      data,
      where,
    })
  }

  async deleteMap(where: Prisma.MapWhereUniqueInput) {
    return this.prisma.map.delete({
      where,
    })
  }
}
