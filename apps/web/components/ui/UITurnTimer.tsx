import { Box, Heading } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { scaled } from "./UIScoreView"

export const UITurnTimer = (props: { turnEndsAt: string }) => {
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    const remaining =
      (new Date(props.turnEndsAt).getTime() - Date.now()) * 0.001
    setRemainingTime(remaining)
    const interval = setInterval(() => {
      setRemainingTime((remaining) => remaining - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [props.turnEndsAt])

  return remainingTime > 0 && remainingTime <= 10.5 ? (
    <Box padding={scaled(4)} position={"fixed"} bottom={1} left={1}>
      <Heading
        fontFamily="Dokdo"
        fontSize="5xl"
        color={remainingTime <= 5 ? "red.300" : "white"}
      >
        {remainingTime.toFixed(0)}
      </Heading>
    </Box>
  ) : null
}
