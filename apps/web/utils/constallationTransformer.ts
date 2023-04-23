import { UnitConstellation } from "database"
import assert from "assert"
import { Coordinate2D } from "../models/UnitConstellation.model"

type TransformationFunction = (coordinates: Coordinate2D[]) => Coordinate2D[]

/** Translates to positive coordinates. */
export const normaliseCoordinates: TransformationFunction = (coordinates) => {
  const [minRow, minCol] = separateCoordinates(coordinates).map((values) => {
    return Math.min(...values)
  })

  return coordinates.map((coordinate) =>
    addCoordinates([-minRow, -minCol], coordinate)
  )
}

/** Rotates and/or mirrors the coordinates. Negative coordinates likely.
 * Example clockwise rotation: `[[0,0],[1,1],[1,2]] => [[0,-0],[1,-1],[2,-0]]` */
export const transformCoordinates = (
  coordinates: Coordinate2D[],
  transformation: {
    rotatedClockwise?: number
    mirrored?: boolean
  }
) => {
  let transformedCoordinates: Coordinate2D[] = coordinates
  if (transformation.rotatedClockwise) {
    for (let i = 0; i < transformation.rotatedClockwise; i++) {
      transformedCoordinates = rotateClockwise(transformedCoordinates)
    }
  }
  if (transformation.mirrored) {
    transformedCoordinates = mirrorAlongXAxis(transformedCoordinates)
  }
  return transformedCoordinates
}

export const addCoordinates = (x: Coordinate2D, y: Coordinate2D) =>
  [x[0] + y[0], x[1] + y[1]] as Coordinate2D

/** Translates the coordinates to the target tile. */
export const translateCoordinatesTo = (
  target: Coordinate2D,
  constellation: Coordinate2D[]
) => {
  return constellation.map((coordinate) => addCoordinates(coordinate, target))
}

export const rotateClockwise: TransformationFunction = (
  coordinates: Coordinate2D[]
) => coordinates.map(([row, col]) => [col, -row])

export const rotateCounterClockwise: TransformationFunction = (
  coordinates: Coordinate2D[]
) => coordinates.map(([row, col]) => [-col, row])

export const mirrorAlongYAxis: TransformationFunction = (
  coordinates: Coordinate2D[]
) => coordinates.map(([row, col]) => [-row, col])

export const mirrorAlongXAxis: TransformationFunction = (
  coordinates: Coordinate2D[]
) => coordinates.map(([row, col]) => [row, -col])

export type SeparatedCoordinates = [Coordinate2D["0"][], Coordinate2D["1"][]]

export const separateCoordinates = (coordinates: Coordinate2D[]) => {
  return coordinates.reduce(
    (acc, cur) => {
      acc[0].push(cur[0])
      acc[1].push(cur[1])
      return acc
    },
    [[], []] as SeparatedCoordinates
  )
}

export const encodeUnitConstellation = (
  coordinates: Coordinate2D[],
  value: number
) => {
  const encoded: UnitConstellation | undefined = { ...UnitConstellation }[
    coordinates.map(([row, col]) => `r${row}c${col}`).join("_") + "_v" + value
  ]
  assert(encoded)
  return encoded
}

export interface Card {
  value: number
  coordinates: Coordinate2D[]
}

export const decodeUnitConstellation = (
  unitConstellationString: UnitConstellation
) => {
  const value = unitConstellationString.split("_v").pop()
  assert(value)
  const regexp = /r(?<row>[0-9]+)c(?<col>[0-9]+)_?/g
  const regExpMatch = [...unitConstellationString.matchAll(regexp)]
  return {
    value: parseInt(value),
    coordinates: regExpMatch.map((match) => {
      assert(match.groups)
      const coordinate: Coordinate2D = [
        parseInt(match.groups.row),
        parseInt(match.groups.col),
      ]
      return coordinate
    }),
  }
}
