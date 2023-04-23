import { Participant } from 'database';
import { MatchRich } from '../database/match/match-rich.type';

export type Evaluation = (match: MatchRich) => Participant[];
