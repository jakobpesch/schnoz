import { UnitConstellation } from "database"
import { Coordinate } from "types"

type TransformationFunction = (coordinates: Coordinate[]) => Coordinate[]

/** Translates to positive coordinates. */
export const normaliseCoordinates: TransformationFunction = (coordinates) => {
  const [minRow, minCol] = separateCoordinates(coordinates).map((values) => {
    return Math.min(...values)
  })

  return coordinates.map((coordinate) =>
    addCoordinates([-minRow, -minCol], coordinate),
  )
}

/** Rotates and/or mirrors the coordinates. Negative coordinates likely.
 * Example clockwise rotation: `[[0,0],[1,1],[1,2]] => [[0,-0],[1,-1],[2,-0]]` */
export const transformCoordinates = (
  coordinates: Coordinate[],
  transformation: {
    rotatedClockwise?: number
    mirrored?: boolean
  },
) => {
  let transformedCoordinates: Coordinate[] = coordinates
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

export const addCoordinates = (x: Coordinate, y: Coordinate) =>
  [x[0] + y[0], x[1] + y[1]] as Coordinate

/** Translates the coordinates to the target tile. */
export const translateCoordinatesTo = (
  target: Coordinate,
  constellation: Coordinate[],
) => {
  return constellation.map((coordinate) => addCoordinates(coordinate, target))
}

export const rotateClockwise: TransformationFunction = (
  coordinates: Coordinate[],
) => coordinates.map(([row, col]) => [col, -row])

export const rotateCounterClockwise: TransformationFunction = (
  coordinates: Coordinate[],
) => coordinates.map(([row, col]) => [-col, row])

export const mirrorAlongYAxis: TransformationFunction = (
  coordinates: Coordinate[],
) => coordinates.map(([row, col]) => [-row, col])

export const mirrorAlongXAxis: TransformationFunction = (
  coordinates: Coordinate[],
) => coordinates.map(([row, col]) => [row, -col])

export type SeparatedCoordinates = [Coordinate["0"][], Coordinate["1"][]]

export const separateCoordinates = (coordinates: Coordinate[]) => {
  return coordinates.reduce(
    (acc, cur) => {
      acc[0].push(cur[0])
      acc[1].push(cur[1])
      return acc
    },
    [[], []] as SeparatedCoordinates,
  )
}

export const encodeUnitConstellation = (
  coordinates: Coordinate[],
  value: number,
) => {
  const encoded: UnitConstellation | undefined = { ...UnitConstellation }[
    coordinates.map(([row, col]) => `r${row}c${col}`).join("_") + "_v" + value
  ]
  if (!encoded) {
    throw new Error("Could not encode unit constellation")
  }
  return encoded
}

export interface Card {
  value: number
  coordinates: Coordinate[]
}

export const decodeUnitConstellation = (
  unitConstellationString: UnitConstellation,
) => {
  const value = unitConstellationString.split("_v").pop()
  if (!value) {
    throw new Error("Could not deencode unit constellation")
  }
  const regexp = /r(?<row>[0-9]+)c(?<col>[0-9]+)_?/g
  const regExpMatch = [...unitConstellationString.matchAll(regexp)]
  return {
    value: parseInt(value),
    coordinates: regExpMatch.map((match) => {
      if (!match.groups) {
        throw new Error("Could not deencode unit constellation")
      }
      const coordinate: Coordinate = [
        parseInt(match.groups.row),
        parseInt(match.groups.col),
      ]
      return coordinate
    }),
  }
}
