import { Match } from "database"
import Mousetrap from "mousetrap"
import { useEffect, useMemo, useState } from "react"

import {
  Card,
  decodeUnitConstellation,
} from "../utils/constallationTransformer"

export function useCards(match: Match | undefined, yourTurn: boolean) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const cards =
    useMemo(() => {
      return match?.openCards?.map(decodeUnitConstellation)
    }, [match]) ?? []

  useEffect(() => {
    match?.openCards.forEach((unitConstellation, index) => {
      const hotkey = index + 1 + ""
      Mousetrap.unbind(hotkey)
      if (yourTurn) {
        Mousetrap.bind(hotkey, () =>
          setSelectedCard(decodeUnitConstellation(unitConstellation))
        )
      }
    })
    Mousetrap.unbind("esc")
    if (yourTurn) {
      Mousetrap.bind("esc", () => setSelectedCard(null))
    }
  }, [match])

  return { cards, selectedCard, setSelectedCard }
}
