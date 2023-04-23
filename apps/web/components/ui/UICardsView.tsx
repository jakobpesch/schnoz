import {
  Box,
  BoxProps,
  Center,
  Circle,
  HStack,
  Kbd,
  Text,
} from "@chakra-ui/react"
import { RenderSettings } from "../../services/SettingsService"
import { Card } from "../../utils/constallationTransformer"
import { viewFactorWidth } from "./UIScoreView"

interface CardViewProps extends BoxProps {
  selected: boolean
  card: Card
  hotkey: string
  tileSize?: number
}

const CardView = (props: CardViewProps) => {
  const {
    selected,
    card,
    hotkey,
    tileSize = RenderSettings.tileSize,
    ...boxProps
  } = props

  const padding = 10
  const containerSize = viewFactorWidth(
    tileSize *
      Math.max(
        3,
        Math.max(...card.coordinates.map(([row, col]) => Math.max(row, col))) +
          1
      ) +
      2 * padding
  )

  return (
    <Box
      background={selected ? "blue.300" : "gray.700"}
      borderRadius={viewFactorWidth(5)}
      borderWidth={viewFactorWidth(2)}
      borderColor={selected ? "transparent" : "gray.500"}
      _hover={{ borderColor: selected ? "transparent" : "blue.300" }}
      position="relative"
      width={containerSize}
      height={containerSize}
      cursor="pointer"
      {...boxProps}
    >
      {card.coordinates.map(([row, col]) => {
        return (
          <Box
            key={"unitConstellation_" + row + "_" + col}
            position="absolute"
            top={viewFactorWidth(tileSize * row + padding)}
            left={viewFactorWidth(tileSize * col + padding)}
            width={viewFactorWidth(tileSize)}
            height={viewFactorWidth(tileSize)}
            background={selected ? "blue.50" : "gray.300"}
          />
        )
      })}
      {card.value > 0 && (
        <Circle
          position="absolute"
          top={viewFactorWidth(-7)}
          right={viewFactorWidth(-7)}
          size={viewFactorWidth(20)}
          bg="yellow.400"
        >
          <Text
            fontSize={viewFactorWidth(15)}
            fontWeight="bold"
            color="yellow.800"
          >
            {card.value}
          </Text>
        </Circle>
      )}

      <Kbd
        position="absolute"
        bottom={viewFactorWidth(-5)}
        right={viewFactorWidth(-5)}
        fontSize={viewFactorWidth(15)}
        bg="gray.700"
        color="gray.300"
        borderColor="gray.300"
      >
        {hotkey}
      </Kbd>
    </Box>
  )
}

interface UICardsViewProps {
  selectedCard: Card | null
  cards: Card[]
  readonly?: boolean
  onSelect: (card: Card) => void
}

export const UICardsView = (props: UICardsViewProps) => (
  <Center
    position="fixed"
    zIndex={3}
    bottom="0"
    left="calc(50vw - 50%)"
    width="100vw"
  >
    <HStack
      spacing={viewFactorWidth(10)}
      p={viewFactorWidth(10)}
      m={viewFactorWidth(10)}
      bg="gray.700"
      borderRadius={viewFactorWidth(5)}
      borderWidth={viewFactorWidth(2)}
      opacity={props.readonly ? 0.5 : 1}
    >
      {props.cards.map((card, index) => {
        const selected =
          JSON.stringify(card) === JSON.stringify(props.selectedCard)
        return (
          <CardView
            selected={selected}
            key={"unitConstellationView " + card.coordinates}
            hotkey={`${index + 1}`}
            card={card}
            pointerEvents={props.readonly ? "none" : "all"}
            tileSize={20}
            onClick={() => props.onSelect(card)}
          />
        )
      })}
    </HStack>
  </Center>
)
