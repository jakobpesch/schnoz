import { Coordinate, RuleEvaluation } from "types"
import { coordinatesAreEqual } from "./coordinateUtils"

let skipIndex = 0

export const hasOverlappingCoordinates = (a: Coordinate[], b: Coordinate[]) => {
  return a.some((aCoord) =>
    b.some((bCoord) => coordinatesAreEqual(aCoord, bCoord)),
  )
}

export const plusFulfillments = (
  beforeFullfillments: RuleEvaluation["fulfillments"],
  afterFullfillments: RuleEvaluation["fulfillments"],
) => {
  let resultPlus = []
  loop1: for (const afterFullfillment of afterFullfillments) {
    for (const beforeFullfillment of beforeFullfillments) {
      const hasOverlap = hasOverlappingCoordinates(
        afterFullfillment,
        beforeFullfillment,
      )

      if (hasOverlap) {
        continue loop1
      }
    }
    resultPlus.push(afterFullfillment)
  }
  return resultPlus
}
export const minusFulfillments = (
  beforeFullfillments: RuleEvaluation["fulfillments"],
  afterFullfillments: RuleEvaluation["fulfillments"],
) => {
  let resultMinus = []
  for (const afterFullfillment of afterFullfillments) {
    let occurences = 0
    for (const beforeFullfillment of beforeFullfillments) {
      const hasOverlap = hasOverlappingCoordinates(
        afterFullfillment,
        beforeFullfillment,
      )

      if (hasOverlap && ++occurences > 1) {
        resultMinus.push(beforeFullfillment)
      }
    }
  }
  return resultMinus
}
