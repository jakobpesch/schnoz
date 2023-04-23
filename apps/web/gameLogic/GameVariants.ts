import { Match, Participant, Rule, UnitConstellation } from "database"
import assert from "assert"
import { MatchRich } from "../types/Match"
import { shuffleArray } from "../utils/arrayUtils"
import { getTileLookup } from "../utils/coordinateUtils"
import { PlacementRuleMap, placementRulesMap } from "./PlacementRule"
import {
  diagnoalRule,
  holeRule,
  ScoringRule,
  ScoringRulesMap,
  stoneRule,
  waterRule,
} from "./ScoringRule"

type EvaluationCondition = (turn: Match["turn"]) => boolean
type Evaluation = (match: MatchRich) => Participant[]

export interface GameType {
  shouldChangeActivePlayer: (turn: Match["turn"]) => boolean
  shouldChangeCards: (turn: Match["turn"]) => boolean
  changedCards: () => UnitConstellation[]
  shouldEvaluate: EvaluationCondition
  evaluate: Evaluation
  scoringRules: ScoringRule[]
  placementRuleMap: PlacementRuleMap
}

export const createCustomGame: (scoringRuleNames: Rule[] | null) => GameType = (
  scoringRuleNames
) => {
  if (!scoringRuleNames) {
    return defaultGame
  }

  return {
    ...defaultGame,
    scoringRules: [...ScoringRulesMap.entries()].reduce<ScoringRule[]>(
      (acc, [ruleName, scoringRule]) => {
        if (scoringRuleNames.includes(ruleName)) {
          return [...acc, scoringRule]
        }
        return [...acc]
      },
      []
    ),
  }
}

const defaultGamePlacementRulesMap = new Map(placementRulesMap)
defaultGamePlacementRulesMap.delete("ADJACENT_TO_ALLY_2")

export const defaultGame: GameType = {
  shouldChangeActivePlayer: (turn: Match["turn"]) => {
    return turn % 2 !== 0
  },
  shouldChangeCards: (turn: Match["turn"]) => {
    return turn % 2 === 0
  },
  changedCards: () => {
    return shuffleArray<UnitConstellation>(
      Object.values({ ...UnitConstellation })
    ).slice(0, 3)
  },
  evaluate: function (match) {
    if (!this.shouldEvaluate(match.turn)) {
      return match.players
    }
    assert(match.map)
    const tileLookup = getTileLookup(match.map.tiles)

    const winners = this.scoringRules.map((rule) => {
      const evaluations = match.players.map((player) => {
        return rule(player.id, tileLookup)
      })
      if (
        evaluations.every(
          (evaluation) => evaluation.points - evaluations[0].points === 0
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
      assert(winningEvaluation)
      return winningEvaluation
    })

    const playersWithUpdatedScores = match.players.map<Participant>(
      (player) => {
        const wonRulesCount = winners.filter(
          (evaluation) => evaluation?.playerId === player.id
        ).length
        return { ...player, score: player.score + wonRulesCount }
      }
    )

    return playersWithUpdatedScores
  },
  shouldEvaluate: (turn) => {
    return turn % 6 === 0
  },
  scoringRules: [waterRule, stoneRule, holeRule, diagnoalRule],
  placementRuleMap: defaultGamePlacementRulesMap,
}
