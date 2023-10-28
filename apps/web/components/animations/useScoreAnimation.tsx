import { useEffect } from "react"
import { Coordinate } from "types"
import { v4 } from "uuid"
import { addAnimationObject, setFulfillments, useMatchStore } from "../../store"

const calculateCenter = (coordinates: Coordinate[]) => {
  if (coordinates.length === 0) {
    return [0, 0] as Coordinate
  }

  let sumX = 0
  let sumY = 0

  for (const coordinate of coordinates) {
    sumX += coordinate[0] // Add the x-coordinate.
    sumY += coordinate[1] // Add the y-coordinate.
  }

  const centerX = sumX / coordinates.length
  const centerY = sumY / coordinates.length
  const center: Coordinate = [centerX, centerY]
  return center
}

export const useScoreAnimation = () => {
  const fulfillmentDifference = useMatchStore(
    (state) => state.fulfillmentDifference,
  )
  const participants = useMatchStore((state) => state.participants)

  useEffect(() => {
    if (!participants || !fulfillmentDifference) {
      return
    }

    for (const participant of participants) {
      const { plus, minus } =
        fulfillmentDifference[participant.id].DIAGONAL_NORTHEAST
      for (const fulfillment of plus) {
        const center = calculateCenter(fulfillment)
        addAnimationObject({ id: v4(), position: center })
      }
      for (const fulfillment of minus) {
        const center = calculateCenter(fulfillment)
        addAnimationObject({ id: v4(), position: center })
      }
      setFulfillments(null)
    }
  }, [fulfillmentDifference])
}
