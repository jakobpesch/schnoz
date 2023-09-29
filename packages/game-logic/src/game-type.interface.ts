import { Match, UnitConstellation } from "database"
import { EvaluationCondition } from "types"
import { Evaluation } from "types"
import { PlacementRuleMap } from "./placementRules/placement-rule-map.type"
import { ScoringRule } from "types"

export interface GameType {
  shouldChangeActivePlayer: (turn: Match["turn"]) => boolean
  shouldChangeCards: (turn: Match["turn"]) => boolean
  changedCards: () => UnitConstellation[]
  shouldEvaluate: EvaluationCondition
  evaluate: Evaluation
  scoringRules: ScoringRule[]
  placementRuleMap: PlacementRuleMap
}
