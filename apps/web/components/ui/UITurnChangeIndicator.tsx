import { Fade, Flex, Heading, ScaleFade, VStack } from "@chakra-ui/react"
import assert from "assert"
import Image from "next/image"
import { useEffect, useState } from "react"
import { MatchRich } from "types"
import { useUserId } from "../../pages/match/[id]"
import { RenderSettings } from "../../services/SettingsService"
import { scaled } from "./UIScoreView"

export const UITurnChangeIndicator = (props: {
  activePlayer: MatchRich["activePlayer"]
  onChangingTurnsStart: () => void
  onChangingTurnsEnd: () => void
}) => {
  const userId = useUserId()
  assert(props.activePlayer)
  const yourTurn = props.activePlayer.userId === userId
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (!isOpen) {
      setIsOpen(true)
      props.onChangingTurnsStart()
      setTimeout(() => {
        setIsOpen(false)
        props.onChangingTurnsEnd()
      }, 2000)
    }
  }, [props.activePlayer.playerNumber])

  return (
    <Flex
      align="center"
      justify="center"
      position="absolute"
      top="0"
      left="0"
      height="100vh"
      width="100vw"
      pointerEvents="none"
    >
      <Fade in={isOpen}>
        <Flex
          height="100vh"
          width="100vw"
          align="center"
          justify="center"
          bg="blackAlpha.700"
          pointerEvents="none"
        >
          <ScaleFade initialScale={0.5} in={isOpen} delay={0.5}>
            <VStack
              bg="gray.700"
              borderWidth={scaled(1)}
              borderRadius={scaled(10)}
              spacing={scaled(16)}
              p={scaled(10)}
              m={scaled(10)}
              boxShadow="dark-lg"
            >
              <Image
                src={
                  RenderSettings.getPlayerAppearance(
                    props.activePlayer.playerNumber
                  ).unit
                }
                width={scaled(1000)}
                height={scaled(1000)}
              />
              <Heading>
                {yourTurn
                  ? "Your "
                  : (props.activePlayer.user.name ?? "Anon ") + "'s "}
                turn!
              </Heading>
            </VStack>
          </ScaleFade>
        </Flex>
      </Fade>
    </Flex>
  )
}
