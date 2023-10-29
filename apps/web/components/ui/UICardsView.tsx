import {
  Box,
  BoxProps,
  Center,
  Circle,
  HStack,
  Kbd,
  Text,
} from "@chakra-ui/react"
import { Card, decodeUnitConstellation } from "coordinate-utils"
import Mousetrap from "mousetrap"
import { useEffect } from "react"
import { RenderSettings } from "../../services/SettingsService"
import { setSelectedCard, useMatchStore } from "../../store"
import { scaled } from "./rule-explainations.const"

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

  const padding = 8
  const maxTiles = 3
  const containerSize = tileSize * maxTiles + 2 * padding + "px"

  return (
    <Box
      background={selected ? "blue.300" : "gray.600"}
      borderRadius={scaled(5)}
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
            top={scaled(tileSize * row + padding) + "px"}
            left={scaled(tileSize * col + padding) + "px"}
            width={scaled(tileSize)}
            height={scaled(tileSize)}
            background={selected ? "blue.50" : "gray.300"}
          />
        )
      })}
      {/* {card.value > 0 && (
        <Circle
          position="absolute"
          top={scaled(-2)}
          right={scaled(-2)}
          size={scaled(6)}
          background="yellow.400"
        >
          <Text fontSize={scaled(15)} fontWeight="bold" color="yellow.800">
            {card.value}
          </Text>
        </Circle>
      )} */}

      <Kbd
        position="absolute"
        bottom={scaled(-2)}
        right={scaled(-2)}
        fontSize={scaled(16)}
        background="gray.700"
        color="gray.300"
        borderColor="gray.300"
      >
        {hotkey}
      </Kbd>
    </Box>
  )
}

export const UICardsView = () => {
  const cards = useMatchStore(
    (state) => state.match?.openCards.map(decodeUnitConstellation) ?? [],
  )
  const match = useMatchStore((state) => state.match)
  const yourTurn = useMatchStore((state) => state.yourTurn())
  const readonly = !yourTurn
  const selectedCard = useMatchStore((state) => state.selectedCard)

  useEffect(() => {
    match?.openCards.forEach((unitConstellation, index) => {
      const hotkey = index + 1 + ""
      Mousetrap.unbind(hotkey)
      if (yourTurn) {
        Mousetrap.bind(hotkey, () =>
          setSelectedCard(decodeUnitConstellation(unitConstellation)),
        )
      }
    })
    Mousetrap.unbind("esc")
    if (yourTurn) {
      Mousetrap.bind("esc", () => setSelectedCard(null))
    }
  }, [match])

  return (
    <Center
      position="fixed"
      zIndex={3}
      bottom="0"
      left="calc(50vw - 50%)"
      width="100vw"
      pointerEvents="none"
    >
      <HStack
        spacing={scaled(4)}
        // padding={scaled(2)}
        margin={scaled(4)}
        // background="blackAlpha.300"
        // borderRadius={scaled(5)}
        // borderWidth={scaled(2)}
        opacity={readonly ? 0.5 : 1}
      >
        {cards.map((card, index) => {
          const selected = JSON.stringify(card) === JSON.stringify(selectedCard)
          return (
            <CardView
              selected={selected}
              key={"unitConstellationView " + card.coordinates}
              hotkey={`${index + 1}`}
              card={card}
              pointerEvents={readonly ? "none" : "all"}
              tileSize={21}
              onClick={() => {
                // const insufficientBonusPoints =
                //   activePlayer.bonusPoints + (card.value ?? 0) <
                //   activatedSpecials.reduce((a, s) => a + s.cost, 0)

                // const isSinglePiece =
                //   card.coordinates.length === 1 &&
                //   coordinatesAreEqual(card.coordinates[0], [0, 0])

                // if (isSinglePiece || insufficientBonusPoints) {
                //   setActivatedSpecials([])
                // }
                setSelectedCard(card)
              }}
            />
          )
        })}
      </HStack>
    </Center>
  )
}
