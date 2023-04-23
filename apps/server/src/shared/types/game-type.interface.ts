import { Match, UnitConstellation } from 'database';
import { EvaluationCondition } from './evaluation/evaluation-condition.type';
import { Evaluation } from './evaluation/evaluation.type';
import { PlacementRuleMap } from './placementRule/placement-rule-map.type';
import { ScoringRule } from './scoring-rule.type';

export interface GameType {
  shouldChangeActivePlayer: (turn: Match['turn']) => boolean;
  shouldChangeCards: (turn: Match['turn']) => boolean;
  changedCards: () => UnitConstellation[];
  shouldEvaluate: EvaluationCondition;
  evaluate: Evaluation;
  scoringRules: ScoringRule[];
  placementRuleMap: PlacementRuleMap;
}
