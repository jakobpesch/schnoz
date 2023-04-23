import { Match } from 'database';

export type EvaluationCondition = (turn: Match['turn']) => boolean;
