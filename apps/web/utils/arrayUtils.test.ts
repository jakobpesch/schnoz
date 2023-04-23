import { shuffleArray } from "./arrayUtils"

test("shuffleArray", () => {
  const array = [0, 1, 2, 3, 4, 5]
  const shuffledArray = shuffleArray(array)
  expect(shuffledArray.length).toBe(array.length)
  array.forEach((element) => {
    expect(shuffledArray).toContain(element)
  })
})
