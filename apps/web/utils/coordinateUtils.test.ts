import { Terrain } from "database"
import { Coordinate2D } from "../models/UnitConstellation.model"
import { TileWithUnit } from "../types/Tile"
import {
  buildTileLookupId,
  coordinateIncludedIn,
  coordinatesAreAdjacent,
  coordinatesAreEqual,
  getAdjacentCoordinates,
  getAdjacentCoordinatesOfConstellation,
  getCoordinateCircle,
  getDiagonallyAdjacentCoordinates,
  getNewlyRevealedTiles,
  getSquareMatrix,
  getTileLookup,
  TileLookup,
} from "./coordinateUtils"

const tiles: TileWithUnit[] = [
  {
    row: 0,
    col: 0,
    mapId: "0",
    visible: false,
    terrain: Terrain.STONE,
    unit: null,
  },
  {
    row: 0,
    col: 1,
    mapId: "0",
    visible: false,
    terrain: Terrain.STONE,
    unit: null,
  },
]

const tileLookup: TileLookup = {
  "0_0": tiles[0],
  "0_1": tiles[1],
}

test("properly derives a lookup id", () => {
  expect(buildTileLookupId([0, 1])).toEqual("0_1")
})

test("create a tile lookup from tiles array", () => {
  expect(getTileLookup(tiles)).toEqual(tileLookup)
})

test("create a square matrix from a radius", () => {
  expect(getSquareMatrix(1)).toEqual([
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ])
  expect(getSquareMatrix(2)).toEqual([
    [-2, -2],
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [0, -2],
    [0, -1],
    [0, 0],
    [0, 1],
    [0, 2],
    [1, -2],
    [1, -1],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, -2],
    [2, -1],
    [2, 0],
    [2, 1],
    [2, 2],
  ])
  expect(getSquareMatrix(3)).toEqual([
    [-3, -3],
    [-3, -2],
    [-3, -1],
    [-3, 0],
    [-3, 1],
    [-3, 2],
    [-3, 3],
    [-2, -3],
    [-2, -2],
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-2, 3],
    [-1, -3],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [-1, 3],
    [0, -3],
    [0, -2],
    [0, -1],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, -3],
    [1, -2],
    [1, -1],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, -3],
    [2, -2],
    [2, -1],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [3, -3],
    [3, -2],
    [3, -1],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
  ])
  expect(getSquareMatrix(4)).toEqual([
    [-4, -4],
    [-4, -3],
    [-4, -2],
    [-4, -1],
    [-4, 0],
    [-4, 1],
    [-4, 2],
    [-4, 3],
    [-4, 4],
    [-3, -4],
    [-3, -3],
    [-3, -2],
    [-3, -1],
    [-3, 0],
    [-3, 1],
    [-3, 2],
    [-3, 3],
    [-3, 4],
    [-2, -4],
    [-2, -3],
    [-2, -2],
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-2, 3],
    [-2, 4],
    [-1, -4],
    [-1, -3],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [-1, 3],
    [-1, 4],
    [0, -4],
    [0, -3],
    [0, -2],
    [0, -1],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, -4],
    [1, -3],
    [1, -2],
    [1, -1],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, -4],
    [2, -3],
    [2, -2],
    [2, -1],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, -4],
    [3, -3],
    [3, -2],
    [3, -1],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [4, -4],
    [4, -3],
    [4, -2],
    [4, -1],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ])
})

test("get circle for radius", () => {
  expect(getCoordinateCircle(1)).toEqual([
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ])
  expect(getCoordinateCircle(2)).toEqual([
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [0, -2],
    [0, -1],
    [0, 0],
    [0, 1],
    [0, 2],
    [1, -2],
    [1, -1],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, -1],
    [2, 0],
    [2, 1],
  ])
  expect(getCoordinateCircle(3)).toEqual([
    [-3, -1],
    [-3, 0],
    [-3, 1],
    [-2, -2],
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-1, -3],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [-1, 3],
    [0, -3],
    [0, -2],
    [0, -1],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, -3],
    [1, -2],
    [1, -1],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, -2],
    [2, -1],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, -1],
    [3, 0],
    [3, 1],
  ])
  expect(getCoordinateCircle(4)).toEqual([
    [-4, -2],
    [-4, -1],
    [-4, 0],
    [-4, 1],
    [-4, 2],
    [-3, -3],
    [-3, -2],
    [-3, -1],
    [-3, 0],
    [-3, 1],
    [-3, 2],
    [-3, 3],
    [-2, -4],
    [-2, -3],
    [-2, -2],
    [-2, -1],
    [-2, 0],
    [-2, 1],
    [-2, 2],
    [-2, 3],
    [-2, 4],
    [-1, -4],
    [-1, -3],
    [-1, -2],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [-1, 2],
    [-1, 3],
    [-1, 4],
    [0, -4],
    [0, -3],
    [0, -2],
    [0, -1],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, -4],
    [1, -3],
    [1, -2],
    [1, -1],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, -4],
    [2, -3],
    [2, -2],
    [2, -1],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, -3],
    [3, -2],
    [3, -1],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [4, -2],
    [4, -1],
    [4, 0],
    [4, 1],
    [4, 2],
  ])
})

test("coordinate included in array", () => {
  const coordinates: Coordinate2D[] = [
    [0, 0],
    [0, 1],
    [12, -5],
  ]
  expect(coordinateIncludedIn(coordinates, [0, 0])).toBe(true)
  expect(coordinateIncludedIn(coordinates, [0, 1])).toBe(true)
  expect(coordinateIncludedIn(coordinates, [12, -5])).toBe(true)
  expect(coordinateIncludedIn(coordinates, [1, 0])).toBe(false)
})

test("coordinate equality", () => {
  expect(coordinatesAreEqual([0, 0], [0, 0])).toBe(true)
  expect(coordinatesAreEqual([0, 0], [0, 1])).toBe(false)
})

test("coordinates are adjacent", () => {
  expect(coordinatesAreAdjacent([0, 0], [0, 1])).toBe(true)
  expect(coordinatesAreAdjacent([-1, 0], [0, 0])).toBe(true)
  expect(coordinatesAreAdjacent([0, 0], [0, -1])).toBe(true)
  expect(coordinatesAreAdjacent([0, 1], [0, 0])).toBe(true)
  expect(coordinatesAreAdjacent([1, 1], [2, 2])).toBe(false)
})

test("get adjacent coordinates", () => {
  expect(getAdjacentCoordinates([0, 0])).toEqual([
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ])
})

test("get diagonally adjacent coordinates", () => {
  expect(getDiagonallyAdjacentCoordinates([0, 0])).toEqual([
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ])

  expect(getDiagonallyAdjacentCoordinates([10, 10])).toEqual([
    [11, 11],
    [9, 11],
    [11, 9],
    [9, 9],
  ])
})

test("get adjacent coordinates of constellation", () => {
  expect(
    getAdjacentCoordinatesOfConstellation([
      [0, 0],
      [0, 1],
      [1, 1],
    ])
  ).toEqual([
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 2],
    [-1, 1],
    [2, 1],
    [1, 2],
  ])
})

test("get newly revealed tiles", () => {
  expect(JSON.stringify(getNewlyRevealedTiles(tileLookup, [[0, 0]]))).toBe(
    '{"tiles":[{"row":0,"col":0,"mapId":"0","visible":true,"terrain":"STONE","unit":null},{"row":0,"col":1,"mapId":"0","visible":true,"terrain":"STONE","unit":null}]}'
  )
  expect(JSON.stringify(getNewlyRevealedTiles(tileLookup, [[0, 2]]))).toBe(
    '{"error":{"message":"Error while placing","statusCode":400}}'
  )
})
