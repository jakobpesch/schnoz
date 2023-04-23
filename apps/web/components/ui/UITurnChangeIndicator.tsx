import { Fade, Flex, Heading, ScaleFade, VStack } from "@chakra-ui/react"
import assert from "assert"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useUserId } from "../../pages/match/[id]"
import { RenderSettings } from "../../services/SettingsService"
import { MatchRich } from "../../types/Match"
import { viewFactorWidth } from "./UIScoreView"

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
              borderWidth={viewFactorWidth(1)}
              borderRadius={viewFactorWidth(10)}
              spacing={viewFactorWidth(16)}
              p={viewFactorWidth(10)}
              m={viewFactorWidth(10)}
              boxShadow="dark-lg"
            >
              <Image
                src={
                  RenderSettings.getPlayerAppearance(
                    props.activePlayer.playerNumber
                  ).unit
                }
                width={viewFactorWidth(1000)}
                height={viewFactorWidth(1000)}
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
