import { TileLookup } from 'src/utils/coordinateUtils';
import { RuleEvaluation } from './rule-evaluation.interface';

export type ScoringRule = (
  playerId: string,
  tileLookup: TileLookup,
) => RuleEvaluation;
