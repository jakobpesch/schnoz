import { UnitConstellation } from "database"
import {
  addCoordinates,
  decodeUnitConstellation,
  encodeUnitConstellation,
  mirrorAlongXAxis,
  mirrorAlongYAxis,
  normaliseCoordinates,
  rotateClockwise,
  rotateCounterClockwise,
  separateCoordinates,
  transformCoordinates,
  translateCoordinatesTo,
} from "./constallationTransformer"

test("normalise coordinates / translating to [0,0]", () => {
  expect(
    normaliseCoordinates([
      [1, 1],
      [0, 0],
      [-1, -1],
    ]),
  ).toEqual([
    [2, 2],
    [1, 1],
    [0, 0],
  ])

  expect(
    normaliseCoordinates([
      [-4, -3],
      [-3, -3],
      [-2, -2],
    ]),
  ).toEqual([
    [0, 0],
    [1, 0],
    [2, 1],
  ])

  expect(
    normaliseCoordinates([
      [-1, 0],
      [0, -1],
    ]),
  ).toEqual([
    [0, 1],
    [1, 0],
  ])
})

test("transforms coordinates", () => {
  expect(
    transformCoordinates(
      [
        [6, 4],
        [-4, 2],
      ],
      { rotatedClockwise: 1 },
    ),
  ).toEqual([
    [4, -6],
    [2, 4],
  ])

  expect(
    transformCoordinates(
      [
        [1, 6],
        [1, 7],
        [1, 8],
        [0, 8],
      ],
      { rotatedClockwise: 3, mirrored: true },
    ),
  ).toEqual([
    [-6, -1],
    [-7, -1],
    [-8, -1],
    [-8, -0],
  ])
})

test("adds two coordinates", () => {
  expect(addCoordinates([6, 4], [-4, 2])).toEqual([2, 6])
})

test("translates coordinates to", () => {
  expect(
    translateCoordinatesTo(
      [5, 1],
      [
        [0, 0],
        [1, 1],
      ],
    ),
  ).toEqual([
    [5, 1],
    [6, 2],
  ])
  expect(
    translateCoordinatesTo(
      [5, 1],
      [
        [0, 0],
        [-2, 1],
      ],
    ),
  ).toEqual([
    [5, 1],
    [3, 2],
  ])
})

test("rotate clockwise", () => {
  expect(
    rotateClockwise([
      [6, 4],
      [5, 4],
    ]),
  ).toEqual([
    [4, -6],
    [4, -5],
  ])
})

test("rotate counter clockwise", () => {
  expect(
    rotateCounterClockwise([
      [6, 4],
      [5, 4],
    ]),
  ).toEqual([
    [-4, 6],
    [-4, 5],
  ])
})

test("mirror along y-axis", () => {
  expect(
    mirrorAlongYAxis([
      [6, 4],
      [5, 4],
    ]),
  ).toEqual([
    [-6, 4],
    [-5, 4],
  ])
})

test("mirror along x-axis", () => {
  expect(
    mirrorAlongXAxis([
      [6, 4],
      [5, 4],
    ]),
  ).toEqual([
    [6, -4],
    [5, -4],
  ])
})

test("separate coordinates", () => {
  expect(
    separateCoordinates([
      [6, 4],
      [5, 4],
      [6, -4],
      [5, 3],
    ]),
  ).toEqual([
    [6, 5, 6, 5],
    [4, 4, -4, 3],
  ])
})

const unitConstellations = { ...UnitConstellation }

test("encode unit constellation", () => {
  expect(
    encodeUnitConstellation(
      [
        [0, 0],
        [0, 1],
      ],
      4,
    ),
  ).toEqual(unitConstellations.r0c0_r0c1_v4)

  expect(
    encodeUnitConstellation(
      [
        [0, 0],
        [0, 1],
        [1, 2],
      ],
      1,
    ),
  ).toEqual(unitConstellations.r0c0_r0c1_r1c2_v1)
})

test("decode unit constellation", () => {
  expect(decodeUnitConstellation("r0c0_r0c1_v4")).toEqual({
    value: 4,
    coordinates: [
      [0, 0],
      [0, 1],
    ],
  })
})
