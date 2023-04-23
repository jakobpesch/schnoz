import { CheckIcon, CloseIcon, LinkIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  CloseButton,
  Grid,
  GridItem,
  Heading,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Stack,
  StackProps,
  Text,
  useClipboard,
  VStack,
} from "@chakra-ui/react"
import { GameSettings, Match, Participant, Rule, Terrain } from "database"
import { Fragment, useEffect, useState } from "react"
import { UpdateGameSettingsPayload } from "../../services/SocketService"
import { ParticipantWithUser } from "../../types/Participant"

const getReadableRuleNames = (rule: Rule) => {
  switch (rule) {
    case Rule.DIAGONAL_NORTHEAST:
      return "Diagon-Alley"
    case Rule.TERRAIN_STONE_NEGATIVE:
      return "Stoned"
    case Rule.TERRAIN_WATER_POSITIVE:
      return "Water D. Law"
    case Rule.HOLE:
      return "Glorious Holes"
  }
}

interface UIPreMatchViewProps extends StackProps {
  matchId: Match["id"]
  settings: GameSettings | null
  userId: string
  createdById: string
  participants: ParticipantWithUser[]
  connectedParticipants: ParticipantWithUser[]
  isLoading: boolean
  onSettingsChange: (settings: UpdateGameSettingsPayload) => void
  onStartGameClick: () => void
  onKick: (participant: ParticipantWithUser) => void
}

export const UIPreMatchView = (props: UIPreMatchViewProps) => {
  const {
    matchId,
    settings,
    userId,
    createdById,
    participants,
    connectedParticipants,
    isLoading,
    onSettingsChange,
    onStartGameClick,
    onKick,
    ...stackProps
  } = props

  const { onCopy, hasCopied } = useClipboard(
    `${window.location.origin}/match/${matchId}/join`
  )

  const [sliderValueWater, setSliderValueWater] = useState(
    settings?.waterRatio ?? 0
  )
  const [sliderValueStone, setSliderValueStone] = useState(
    settings?.stoneRatio ?? 0
  )
  const [sliderValueTree, setSliderValueTree] = useState(
    settings?.treeRatio ?? 0
  )

  useEffect(() => {
    setSliderValueWater(settings?.waterRatio ?? 0)
    setSliderValueStone(settings?.stoneRatio ?? 0)
    setSliderValueTree(settings?.treeRatio ?? 0)
  }, [settings])

  if (!settings) {
    return <Box>No Settings</Box>
  }

  const handleOnKick = (participant: ParticipantWithUser) => {
    onKick(participant)
  }

  const isGameFull = participants.length === 2
  const isHost = userId === createdById
  const slots =
    participants.length === 1 ? [...participants, null] : participants
  const allConnected = connectedParticipants.length === 2
  return (
    <VStack align="start" spacing="8" maxWidth="md" {...stackProps}>
      <Heading>Game Settings</Heading>
      <Stack width="full">
        <Text fontWeight="bold">Participants</Text>
        <HStack width="full">
          {slots.map((participant, index) => {
            if (!participant) {
              return (
                <>
                  <HStack
                    width="full"
                    borderWidth={2}
                    borderRadius="lg"
                    borderStyle="dashed"
                    borderColor="gray.600"
                    paddingX="4"
                    minHeight="16"
                    key="empty"
                  >
                    <Text fontWeight="bold" fontStyle="italic" color="gray.600">
                      Empty
                    </Text>
                  </HStack>
                  {index === 0 && <Text fontWeight="bold">vs.</Text>}
                </>
              )
            }
            const isConnected = connectedParticipants.some(
              (p) => p.id === participant.id
            )
            return (
              <>
                <HStack
                  width="full"
                  borderWidth={2}
                  borderRadius="lg"
                  borderColor={isConnected ? "green.500" : "gray.600"}
                  backgroundColor={isConnected ? "green.900" : "gray.800"}
                  paddingX="4"
                  minHeight="16"
                  key={participant.id}
                >
                  <Text
                    fontWeight="bold"
                    color={isConnected ? "gray.200" : "gray.600"}
                  >
                    {participant.user.name}
                  </Text>
                  <Spacer />
                  {isHost && participant.userId !== props.userId && (
                    <CloseButton
                      color="gray.400"
                      onClick={() => handleOnKick(participant)}
                    />
                  )}
                </HStack>
                {index === 0 && <Text fontWeight="bold">vs.</Text>}
              </>
            )
          })}
        </HStack>
      </Stack>

      <Stack width="full" spacing="8">
        <Stack width="full">
          <Text fontWeight="bold">Map size</Text>
          <ButtonGroup isAttached>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.mapSize === 11 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ mapSize: 11 })}
            >
              Small
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.mapSize === 21 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ mapSize: 21 })}
            >
              Medium
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.mapSize === 31 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ mapSize: 31 })}
            >
              Large
            </Button>
          </ButtonGroup>
        </Stack>
        <Stack width="full">
          <Text fontWeight="bold">Game length</Text>
          <ButtonGroup isAttached>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.maxTurns === 6 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ maxTurns: 6 })}
            >
              Very Short
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.maxTurns === 12 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ maxTurns: 12 })}
            >
              Short
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.maxTurns === 24 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ maxTurns: 24 })}
            >
              Standard
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isHost}
              _disabled={{ opacity: 1, cursor: "default" }}
              colorScheme={settings.maxTurns === 36 ? "blue" : "gray"}
              onClick={() => onSettingsChange({ maxTurns: 36 })}
            >
              Long
            </Button>
          </ButtonGroup>
        </Stack>
        <Stack width="full">
          <Text fontWeight="bold">Rules</Text>
          <CheckboxGroup>
            {Object.values(Rule).map((rule) => (
              <Checkbox
                key={rule}
                isChecked={settings.rules.includes(rule)}
                readOnly={!isHost}
                onChange={(e) => {
                  const isChecked = e.target.checked
                  if (isChecked) {
                    onSettingsChange({ rules: [...settings.rules, rule] })
                  } else {
                    onSettingsChange({
                      rules: [...settings.rules].filter((r) => r !== rule),
                    })
                  }
                }}
              >
                {getReadableRuleNames(rule)}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Stack>
      </Stack>
      <Stack width="full">
        <Text fontWeight="bold">Terrain</Text>
        <Grid templateColumns="repeat(5, 1fr)" alignItems="center">
          {Object.values(Terrain).map((terrain) => {
            const ratio =
              terrain === "WATER"
                ? "waterRatio"
                : terrain === "STONE"
                ? "stoneRatio"
                : "treeRatio"
            const setter =
              terrain === "WATER"
                ? setSliderValueWater
                : terrain === "STONE"
                ? setSliderValueStone
                : setSliderValueTree
            const state =
              terrain === "WATER"
                ? sliderValueWater
                : terrain === "STONE"
                ? sliderValueStone
                : sliderValueTree
            return (
              <Fragment key={terrain}>
                <GridItem>
                  <Text>{terrain}</Text>
                </GridItem>
                <GridItem colSpan={4} alignSelf="center">
                  <Slider
                    id="slider"
                    value={state}
                    min={0}
                    max={10}
                    isReadOnly={!isHost}
                    colorScheme="teal"
                    onChange={(v) => setter(v)}
                    onChangeEnd={(v) => {
                      onSettingsChange({ [ratio]: v })
                      setter(v)
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </GridItem>
              </Fragment>
            )
          })}
        </Grid>
      </Stack>

      {/* <VStack>
          <Text>{match?.players[0].slice(-5)}</Text>
          <Text fontStyle={!match?.players[1] ? "italic" : "normal"}>
            {match?.players[1] ? match?.players[1].slice(-5) : "Empty..."}
          </Text>
        </VStack> */}

      {isHost && (
        <HStack>
          <Button
            size="lg"
            colorScheme="blue"
            disabled={!isGameFull || !allConnected || isLoading}
            isLoading={isLoading}
            onClick={() => {
              onStartGameClick()
            }}
          >
            {!isGameFull
              ? "Waiting for opponent..."
              : !allConnected
              ? "Opponent disconnected..."
              : "Start Game"}
          </Button>

          <Button
            size="lg"
            colorScheme="blue"
            variant="outline"
            isLoading={isLoading}
            onClick={() => {
              onCopy()
            }}
            leftIcon={hasCopied ? <CheckIcon /> : <LinkIcon />}
          >
            Invite Link
          </Button>
        </HStack>
      )}
    </VStack>
  )
}
