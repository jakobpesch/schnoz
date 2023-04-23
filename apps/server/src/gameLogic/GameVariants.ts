import { Match, Participant, Rule, UnitConstellation } from 'database';
import { GameType } from 'src/shared/types/game-type.interface';
import { placementRulesMap } from 'src/shared/types/placementRule/placement-rule-map.const';
import { ScoringRule } from 'src/shared/types/scoring-rule.type';
import { shuffleArray } from '../utils/arrayUtils';
import { getTileLookup } from '../utils/coordinateUtils';
import {
  diagnoalRule,
  holeRule,
  ScoringRulesMap,
  stoneRule,
  waterRule,
} from './ScoringRule';

export const createCustomGame: (scoringRuleNames: Rule[] | null) => GameType = (
  scoringRuleNames,
) => {
  if (!scoringRuleNames) {
    return defaultGame;
  }

  return {
    ...defaultGame,
    scoringRules: [...ScoringRulesMap.entries()].reduce<ScoringRule[]>(
      (acc, [ruleName, scoringRule]) => {
        if (scoringRuleNames.includes(ruleName)) {
          return [...acc, scoringRule];
        }
        return [...acc];
      },
      [],
    ),
  };
};

const defaultGamePlacementRulesMap = new Map(placementRulesMap);
defaultGamePlacementRulesMap.delete('ADJACENT_TO_ALLY_2');

export const defaultGame: GameType = {
  shouldChangeActivePlayer: (turn: Match['turn']) => {
    return turn % 2 !== 0;
  },
  shouldChangeCards: (turn: Match['turn']) => {
    return turn % 2 === 0;
  },
  changedCards: () => {
    return shuffleArray<UnitConstellation>(
      Object.values({ ...UnitConstellation }),
    ).slice(0, 3);
  },
  evaluate: function (match) {
    if (!this.shouldEvaluate(match.turn)) {
      return match.players;
    }

    if (!match.map) {
      console.error('Map missing');
      return match.players;
    }
    const tileLookup = getTileLookup(match.map.tiles);

    const winners = (this.scoringRules as ScoringRule[]).map((rule) => {
      const evaluations = match.players.map((player) => {
        return rule(player.id, tileLookup);
      });
      if (
        evaluations.every(
          (evaluation) => evaluation.points - evaluations[0].points === 0,
        )
      ) {
        return null;
      }
      const winningEvaluation = evaluations
        .sort((a, b) => {
          if (a.points > b.points) {
            return -1;
          } else {
            return 1;
          }
        })
        .shift();
      if (!winningEvaluation) {
        throw new Error('Could not evaluate');
      }
      return winningEvaluation;
    });

    const playersWithUpdatedScores = match.players.map<Participant>(
      (player) => {
        const wonRulesCount = winners.filter(
          (evaluation) => evaluation?.playerId === player.id,
        ).length;
        return { ...player, score: player.score + wonRulesCount };
      },
    );

    return playersWithUpdatedScores;
  },
  shouldEvaluate: (turn) => {
    return turn % 6 === 0;
  },
  scoringRules: [waterRule, stoneRule, holeRule, diagnoalRule],
  placementRuleMap: defaultGamePlacementRulesMap,
};
