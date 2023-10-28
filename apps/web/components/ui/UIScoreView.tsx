import { NotAllowedIcon } from "@chakra-ui/icons"
import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  VStack,
} from "@chakra-ui/react"
import assert from "assert"
import { Rule } from "database"
import Image from "next/image"
import { useMemo, useRef } from "react"
import { RuleEvaluation } from "types"
import { RenderSettings } from "../../services/SettingsService"
import { setShowRuleEvaluationHighlights, useMatchStore } from "../../store"
import { HoveredTooltip } from "../HoveredTooltip"
import { ruleExplainations, scaled } from "./rule-explainations.const"

export const UIScoreView = () => {
  const turn = useMatchStore((state) => state.match?.turn)

  const getEvaluationsMap = useMatchStore((state) => state.getEvaluationsMap)
  const rulesMapRef = useRef<Map<Rule, RuleEvaluation[]> | null>(null)
  const rulesMap = useMemo(() => new Map(getEvaluationsMap()), [turn])
  rulesMapRef.current = rulesMap

  const player1 = useMatchStore((state) => state.getParticipant(0))
  assert(player1)
  const player1Connected = useMatchStore((state) =>
    state.isParticipantConnected(0),
  )

  const player2 = useMatchStore((state) => state.getParticipant(1))
  assert(player2)
  const player2Connected = useMatchStore((state) =>
    state.isParticipantConnected(1),
  )

  return (
    <VStack position="fixed" top="0" right="0">
      <VStack
        background="blackAlpha.300"
        borderWidth={scaled(1)}
        borderRadius={scaled(10)}
        spacing={scaled(4)}
        padding={scaled(1)}
        margin={scaled(4)}
      >
        <HStack spacing={scaled(4)}>
          <Flex
            key={player1.id}
            align="center"
            justify="center"
            gap={scaled(4)}
          >
            <Box position="relative">
              <Image
                alt=""
                priority
                src={
                  RenderSettings.getPlayerAppearance(player1.playerNumber).unit
                }
                width={scaled(50)}
                height={scaled(50)}
              />
              {!player1Connected && (
                <NotAllowedIcon
                  position="absolute"
                  left="0"
                  top="0"
                  color="red"
                  boxSize={scaled(50)}
                />
              )}
            </Box>
            <Heading fontSize={scaled(30)}>{player1.score}</Heading>
          </Flex>
          <Divider orientation="vertical"></Divider>
          <Flex
            key={player2.id}
            align="center"
            justify="center"
            gap={scaled(4)}
          >
            <Heading fontSize={scaled(30)}>{player2.score}</Heading>
            <Box position="relative">
              <Image
                priority
                alt=""
                src={
                  RenderSettings.getPlayerAppearance(player2.playerNumber).unit
                }
                width={scaled(50)}
                height={scaled(50)}
              />
              {!player2Connected && (
                <NotAllowedIcon
                  position="absolute"
                  left="0"
                  top="0"
                  color="red"
                  boxSize={scaled(50)}
                />
              )}
            </Box>
          </Flex>
        </HStack>
        <Divider />
        {rulesMap && (
          <Stack spacing={scaled(2)} width="full">
            {Array.from(rulesMap.values()).map(
              (ruleEvaluations, ruleEvalsIndex) => {
                return (
                  <VStack
                    key={"ruleEvals_" + ruleEvalsIndex}
                    padding={scaled(1)}
                    borderRadius={scaled(10)}
                    background={
                      ruleEvaluations[0].points === ruleEvaluations[1].points
                        ? "none"
                        : ruleEvaluations[0].points > ruleEvaluations[1].points
                        ? RenderSettings.getPlayerAppearance(
                            player1.playerNumber,
                          ).color
                        : RenderSettings.getPlayerAppearance(
                            player2.playerNumber,
                          ).color
                    }
                  >
                    <Flex
                      gap={scaled(2)}
                      align="center"
                      justify="space-around"
                      width="full"
                      color="white"
                    >
                      <Heading
                        minWidth={scaled(30)}
                        rounded={scaled(8)}
                        _hover={{
                          bg: "whiteAlpha.300",
                        }}
                        textAlign="center"
                        cursor="default"
                        fontSize={scaled(30)}
                        size="md"
                        onMouseEnter={() =>
                          setShowRuleEvaluationHighlights(
                            ruleEvaluations[0].fulfillments.flat(),
                          )
                        }
                        onMouseLeave={() => setShowRuleEvaluationHighlights([])}
                      >
                        {ruleEvaluations[0].points}
                      </Heading>
                      <HoveredTooltip
                        trigger={
                          <Image
                            alt=""
                            src={RenderSettings.getRuleAppearance(
                              ruleEvaluations[0].type,
                            )}
                            width={scaled(40)}
                            height={scaled(40)}
                          />
                        }
                        header={
                          <HStack>
                            <Image
                              alt=""
                              src={RenderSettings.getRuleAppearance(
                                ruleEvaluations[0].type,
                              )}
                              width={scaled(40)}
                              height={scaled(40)}
                            />

                            <Heading fontSize={scaled(25)}>
                              {RenderSettings.getRuleName(
                                ruleEvaluations[0].type,
                              )}
                            </Heading>
                          </HStack>
                        }
                        body={ruleExplainations.get(ruleEvaluations[0].type)}
                      />

                      <Heading
                        minWidth={scaled(30)}
                        rounded={scaled(8)}
                        _hover={{
                          bg: "whiteAlpha.300",
                        }}
                        textAlign="center"
                        cursor="default"
                        fontSize={scaled(25)}
                        size="md"
                        onMouseEnter={() =>
                          setShowRuleEvaluationHighlights(
                            ruleEvaluations[1].fulfillments.flat(),
                          )
                        }
                        onMouseLeave={() => setShowRuleEvaluationHighlights([])}
                      >
                        {ruleEvaluations[1].points}
                      </Heading>
                    </Flex>
                  </VStack>
                )
              },
            )}
          </Stack>
        )}
      </VStack>
    </VStack>
  )
}
