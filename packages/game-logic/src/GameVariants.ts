import { getTileLookup, shuffleArray } from "coordinate-utils"
import { GameSettings, Participant, UnitConstellation } from "database"
import { ScoringRule } from "types"
import {
  ScoringRulesMap,
  diagnoalRule,
  holeRule,
  stoneRule,
  waterRule,
} from "./ScoringRule"
import { GameType } from "./game-type.interface"
import { placementRulesMap } from "./placementRules/placement-rule-map.const"

export const createCustomGame = (gameSettings: GameSettings) => {
  if (!gameSettings.rules) {
    return defaultGame
  }

  return {
    ...defaultGame,
    cardsCount: gameSettings.cardsCount,
    scoringRules: [...ScoringRulesMap.entries()].reduce<ScoringRule[]>(
      (acc, [ruleName, scoringRule]) => {
        if (gameSettings.rules.includes(ruleName)) {
          return [...acc, scoringRule]
        }
        return [...acc]
      },
      [],
    ),
  }
}

export const defaultGame: GameType = {
  shouldChangeActivePlayer(turn) {
    return turn % 2 !== 0
  },
  shouldChangeCards(turn) {
    return turn % 2 === 0
  },
  changedCards() {
    return shuffleArray<UnitConstellation>(
      Object.values({ ...UnitConstellation }),
    ).slice(0, this.cardsCount)
  },
  shouldEvaluate(turn) {
    return turn % 6 === 0
  },
  evaluate(match) {
    if (!this.shouldEvaluate(match.turn)) {
      return match.players
    }

    if (!match.map) {
      console.error("Map missing")
      return match.players
    }
    const tileLookup = getTileLookup(match.map.tiles)

    const winners = this.scoringRules.map((rule) => {
      const evaluations = match.players.map((player) => {
        return rule(player.id, tileLookup)
      })
      if (
        evaluations.every(
          (evaluation) => evaluation.points - evaluations[0].points === 0,
        )
      ) {
        return null
      }
      const winningEvaluation = evaluations
        .sort((a, b) => {
          if (a.points > b.points) {
            return -1
          } else {
            return 1
          }
        })
        .shift()
      if (!winningEvaluation) {
        throw new Error("Could not evaluate")
      }
      return winningEvaluation
    })

    const playersWithUpdatedScores = match.players.map<Participant>(
      (player) => {
        const wonRulesCount = winners.filter(
          (evaluation) => evaluation?.playerId === player.id,
        ).length
        return { ...player, score: player.score + wonRulesCount }
      },
    )

    return playersWithUpdatedScores
  },
  scoringRules: [waterRule, stoneRule, holeRule, diagnoalRule],
  placementRuleMap: {
    NO_TERRAIN: placementRulesMap.NO_TERRAIN,
    NO_UNIT: placementRulesMap.NO_UNIT,
    ADJACENT_TO_UNIT: placementRulesMap.ADJACENT_TO_UNIT,
    // ADJACENT_TO_ALLY: placementRulesMap.ADJACENT_TO_ALLY,
    // ADJACENT_TO_ALLY_2: placementRulesMap.ADJACENT_TO_ALLY_2,
    // ADJACENT_TO_ENEMY: placementRulesMap.ADJACENT_TO_ENEMY,
    // ADJACENT_TO_ENEMY_2: placementRulesMap.ADJACENT_TO_ENEMY_2,
    // ADJACENT_TO_UNIT_2: placementRulesMap.ADJACENT_TO_UNIT_2,
  },
  cardsCount: 3,
}
