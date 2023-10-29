import { Flex, Heading, HStack, Stack } from "@chakra-ui/react"
import assert from "assert"
import { GameSettings, Match, Participant } from "database"
import { defaultGame } from "game-logic"
import Image, { StaticImageData } from "next/image"
import { useMemo } from "react"
import { RenderSettings } from "../../services/SettingsService"
import { useMatchStore } from "../../store"
import { scaled } from "./rule-explainations.const"

const getTurns = (
  match: Match,
  players: Participant[],
  gameSettings: GameSettings,
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
    (player) => player.userId === match.createdById,
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

export const UITurnsView = () => {
  const match = useMatchStore((state) => state.match)
  const participants = useMatchStore((state) => state.participants)
  const gameSettings = useMatchStore((state) => state.gameSettings)
  const turnsUI = useMemo(() => {
    if (!match || !participants || !gameSettings) {
      return []
    }
    const turns = getTurns(match, participants, gameSettings)
    for (let index = 1; index < match.turn; index++) {
      turns.shift()
      if (turns[0].evaluate) {
        turns.shift()
      }
    }
    return turns
  }, [match])

  return (
    <Flex position="fixed" top="0" left="0">
      <Stack
        bg="blackAlpha.300"
        backdropFilter="auto"
        backdropBlur="10px"
        borderWidth={scaled(1)}
        borderRadius={scaled(10)}
        spacing={scaled(16)}
        p={scaled(1)}
        m={scaled(4)}
        maxWidth="50vw"
        overflowX="scroll"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <HStack position="relative" spacing={scaled(1)}>
          {turnsUI.map((turnUI, index) => {
            const borderStyle =
              index === 0
                ? {
                    borderRadius: scaled(7),
                    borderWidth: scaled(2),
                    borderColor: "green.300",
                    bg: "green.400",
                  }
                : {}
            if (turnUI.evaluate) {
              return (
                <Heading
                  px={scaled(4)}
                  flexShrink={0}
                  key={index + "eval"}
                  textAlign="center"
                  fontSize={scaled(turnsUI.length === index + 1 ? 28 : 16)}
                  {...borderStyle}
                >
                  ⭐️
                </Heading>
              )
            } else {
              return (
                <Flex
                  flexShrink={0}
                  align="center"
                  justify="center"
                  key={index + "player"}
                  {...borderStyle}
                >
                  <Image
                    src={turnUI.icon}
                    alt=""
                    width={scaled(40)}
                    height={scaled(40)}
                  />
                </Flex>
              )
            }
          })}
        </HStack>
      </Stack>
    </Flex>
  )
}
