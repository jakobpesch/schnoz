import { RuleEvaluation } from "types"
import { minusFulfillments, plusFulfillments } from "./fulfillmentsDiffs"

const afterFullfillments: RuleEvaluation["fulfillments"] = [
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3], // new
    [4, 4],
    [5, 5],
    [6, 6],
  ],
  [
    [20, 20],
    [21, 21],
    [22, 22],
  ],
  [
    [10, 10], //
    [11, 11], // new
    [12, 12], //
  ],
  [
    [30, 30],
    [31, 31],
    [32, 32],
    [33, 33], // new
    [34, 34],
    [35, 35],
    [36, 36],
    [37, 37],
    [38, 38],
  ],
]
const beforeFullfillments: RuleEvaluation["fulfillments"] = [
  [
    [20, 20],
    [21, 21],
    [22, 22],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  [
    [4, 4],
    [5, 5],
    [6, 6],
  ],
  [
    [30, 30],
    [31, 31],
    [32, 32],
  ],
  [
    [34, 34],
    [35, 35],
    [36, 36],
    [37, 37],
    [38, 38],
  ],
]

const expectedPlus: RuleEvaluation["fulfillments"] = [
  [
    [10, 10], //
    [11, 11], // new
    [12, 12], //
  ],
]
const expectedMinus: RuleEvaluation["fulfillments"] = [
  [
    [4, 4],
    [5, 5],
    [6, 6],
  ],
  [
    [34, 34],
    [35, 35],
    [36, 36],
    [37, 37],
    [38, 38],
  ],
]

const orExpectedMinus: RuleEvaluation["fulfillments"] = [
  [
    [4, 4],
    [5, 5],
    [6, 6],
  ],
]
test("plus", () => {
  const plus = plusFulfillments(beforeFullfillments, afterFullfillments)
  expect(plus).toEqual(expectedPlus)
})

test("minus", () => {
  const minus = minusFulfillments(beforeFullfillments, afterFullfillments)
  expect(minus).toEqual(expectedMinus)
})
