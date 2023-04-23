import { RuleEvaluation } from "./rule-evaluation.interface";
import { TileLookup } from "./tile-lookup.type";

export type ScoringRule = (
  playerId: string,
  tileLookup: TileLookup
) => RuleEvaluation;
