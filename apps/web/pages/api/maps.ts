// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { GameSettings, Prisma, Terrain } from "database"
import type { NextApiRequest, NextApiResponse } from "next"
import { Coordinate2D } from "../../models/UnitConstellation.model"
import { prisma } from "../../prisma/client"
import { matchRichInclude } from "../../types/Match"
import { translateCoordinatesTo } from "../../utils/constallationTransformer"
import {
  coordinateIncludedIn,
  getCoordinateCircle,
} from "../../utils/coordinateUtils"

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
  const centerCoordinate: Coordinate2D = [halfMapSize, halfMapSize]

  const initialVisionRadius = 3
  const initialVision = translateCoordinatesTo(
    centerCoordinate,
    getCoordinateCircle(initialVisionRadius)
  )

  const saveAreaRadius = 2
  const safeArea = translateCoordinatesTo(
    centerCoordinate,
    getCoordinateCircle(saveAreaRadius)
  )

  const tilesCreatePayload: Prisma.TileCreateManyMapInput[] = []
  const indices = [...Array(gameSettings.mapSize).keys()]

  indices.forEach((row) => {
    indices.forEach((col) => {
      const coordinate: Coordinate2D = [row, col]

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method } = req
  const userId = body.userId
  const matchId = body.matchId
  if (typeof matchId !== "string") {
    res.status(404).end(`Invalid match id provided: ${matchId}.`)
    return
  }
  switch (method) {
    case "POST":
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: { id: true, createdById: true, gameSettings: true, map: true },
      })

      if (match === null) {
        res.status(404).end(`Match with id ${matchId} not found.`)
        return
      }
      if (match.map) {
        res.status(500).end(`Match with id ${matchId} already has a map.`)
        return
      }
      if (match.createdById !== userId) {
        res.status(400).end("Only the host can create a map.")
        return
      }
      if (!match.gameSettings) {
        res.status(500).end("Missing Settings")
        return
      }

      const { colCount, rowCount, tiles } = getInitialiseMapPayload(
        match.gameSettings
      )
      const halfMapSize = Math.floor(match.gameSettings.mapSize / 2)
      const map = await prisma.$transaction(async (tx) => {
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

      res.status(201).json(map)
      break
    case "GET":
      const matches = await prisma.match.findMany({
        include: matchRichInclude,
      })
      res.status(200).json(matches)
      break
    default:
      res.setHeader("Allow", ["POST", "GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
