import { GameSettings, Match, UnitConstellation } from "database"
import { Evaluation, EvaluationCondition, ScoringRule } from "types"
import { PlacementRuleMap } from "./placementRules/placement-rule-map.type"

export interface GameType {
  shouldChangeActivePlayer: (turn: Match["turn"]) => boolean
  shouldChangeCards: (turn: Match["turn"]) => boolean
  changedCards: () => UnitConstellation[]
  shouldEvaluate: EvaluationCondition
  evaluate: Evaluation
  scoringRules: ScoringRule[]
  placementRuleMap: PlacementRuleMap
  cardsCount: GameSettings["cardsCount"]
}
