import { Participant, Rule } from 'database';
import { Coordinate } from './coordinate.type';

export interface RuleEvaluation {
  playerId: Participant['id'];
  type: Rule;
  points: number;
  /** fulfillments[0] = One fulfillment of the rule gives one point. fulfillment[0][0] is the coordinate, that (in part or completely) fulfills the rule */
  fulfillments: Coordinate[][];
}
