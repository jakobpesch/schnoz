import { Box, Flex, Heading, HStack, Stack } from "@chakra-ui/react"
import { GameSettings, Match, Participant } from "database"
import assert from "assert"
import Image, { StaticImageData } from "next/image"
import { useMemo } from "react"
import { defaultGame } from "../../gameLogic/GameVariants"
import { RenderSettings } from "../../services/SettingsService"

import { viewFactorWidth } from "./UIScoreView"

const getTurns = (
  match: Match,
  players: Participant[],
  gameSettings: GameSettings
) => {
  const turnsUI: (
    | {
        turn: Match["turn"]
        playerId: Participant["id"]
        icon: StaticImageData
        evaluate?: undefined
      }
    | {
        turn?: undefined
        playerId?: undefined
        icon?: undefined
        evaluate: true
      }
  )[] = []
  const startingPlayer = players.find(
    (player) => player.userId === match.createdById
  )
  assert(startingPlayer)

  let activePlayer = startingPlayer
  for (let turn = 1; turn <= gameSettings.maxTurns; turn++) {
    turnsUI.push({
      turn,
      playerId: activePlayer.id,
      icon: RenderSettings.getPlayerAppearance(activePlayer.playerNumber).unit,
    })

    if (defaultGame.shouldChangeActivePlayer(turn)) {
      activePlayer = players.find((player) => player.id !== activePlayer.id)!
    }
    if (defaultGame.shouldEvaluate(turn)) {
      turnsUI.push({ evaluate: true })
    }
  }
  return turnsUI
}

export const UITurnsView = (props: {
  match: Match
  players: Participant[]
  gameSettings: GameSettings
}) => {
  const turnsUI = useMemo(() => {
    const turns = getTurns(props.match, props.players, props.gameSettings)
    for (let index = 1; index < props.match.turn; index++) {
      turns.shift()
      if (turns[0].evaluate) {
        turns.shift()
      }
    }
    return turns
  }, [props.match])

  return (
    <Flex position="fixed" top="0" left="0">
      <Stack
        bg="gray.700"
        borderWidth={viewFactorWidth(1)}
        borderRadius={viewFactorWidth(10)}
        spacing={viewFactorWidth(16)}
        p={viewFactorWidth(10)}
        m={viewFactorWidth(10)}
        maxWidth="50vw"
        overflowX="hidden"
      >
        <HStack position="relative" spacing={viewFactorWidth(16)}>
          {turnsUI.map((turnUI, index) => {
            const borderStyle =
              index === 0
                ? {
                    borderRadius: "lg",
                    borderWidth: "3px",
                    borderColor: "green",
                    bg: "green.800",
                  }
                : {}
            if (turnUI.evaluate) {
              return (
                <Heading
                  key={index + "eval"}
                  textAlign="center"
                  fontSize={
                    index === 0 ? viewFactorWidth(35) : viewFactorWidth(20)
                  }
                  {...borderStyle}
                >
                  ⭐️
                </Heading>
              )
            } else {
              return (
                <Flex
                  align="center"
                  justify="center"
                  key={index + "player"}
                  {...borderStyle}
                >
                  <Box
                    width={viewFactorWidth(40)}
                    height={viewFactorWidth(40)}
                    minWidth={viewFactorWidth(40)}
                    minHeight={viewFactorWidth(40)}
                  >
                    <Image src={turnUI.icon} />
                  </Box>
                </Flex>
              )
            }
          })}
        </HStack>
      </Stack>
    </Flex>
  )
}
