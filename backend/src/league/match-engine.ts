import { Condition, Position } from '../players/player.constants';
import { MatchResult } from './league.constants';

type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';
type LinePosition = Exclude<Position, 'GOL'>;

const UNFIT_ATTRIBUTE_PERCENT = 85;
const ATTACK_ATTRIBUTE: Record<LinePosition, DuelAttribute> = {
  ZAG: 'dribbling',
  LAT: 'dribbling',
  MEI: 'passing',
  ATA: 'shooting',
};
const DEFENSE_ATTRIBUTE: DuelAttribute = 'defending';
const DUELS_PER_SIDE = [
  { attackerIndex: 4, defenderIndex: 0 },
  { attackerIndex: 3, defenderIndex: 1 },
  { attackerIndex: 2, defenderIndex: 2 },
];

export type MatchPlayer = Record<DuelAttribute, number> & {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
};

export interface MatchTeam {
  clubId: number;
  starters: MatchPlayer[];
}

export interface DuelParticipant {
  player: MatchPlayer;
  attribute: DuelAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attackingClubId: number;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export interface MatchOutcome {
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
  duels: Duel[];
}

export function playMatch(home: MatchTeam, away: MatchTeam): MatchOutcome {
  const duels = [...playAttacks(home, away), ...playAttacks(away, home)].map((duel, index) => ({
    ...duel,
    order: index + 1,
  }));
  const homeGoals = countGoals(duels, home.clubId);
  const awayGoals = countGoals(duels, away.clubId);
  return { homeGoals, awayGoals, result: decideResult(homeGoals, awayGoals), duels };
}

export function effectiveAttribute(player: MatchPlayer, attribute: DuelAttribute): number {
  const value = player[attribute];
  if (player.condition !== 'MAL_CONDICIONADO') {
    return value;
  }
  return Math.floor((value * UNFIT_ATTRIBUTE_PERCENT + 50) / 100);
}

function playAttacks(attacking: MatchTeam, defending: MatchTeam): Omit<Duel, 'order'>[] {
  return DUELS_PER_SIDE.map(({ attackerIndex, defenderIndex }) => {
    const attacker = toAttacker(attacking.starters[attackerIndex]);
    const defender = toDefender(defending.starters[defenderIndex]);
    return {
      attackingClubId: attacking.clubId,
      attacker,
      defender,
      goal: attacker.value > defender.value,
    };
  });
}

function toAttacker(player: MatchPlayer): DuelParticipant {
  const attribute = ATTACK_ATTRIBUTE[player.position as LinePosition];
  return { player, attribute, value: effectiveAttribute(player, attribute) };
}

function toDefender(player: MatchPlayer): DuelParticipant {
  return {
    player,
    attribute: DEFENSE_ATTRIBUTE,
    value: effectiveAttribute(player, DEFENSE_ATTRIBUTE),
  };
}

function countGoals(duels: Duel[], clubId: number): number {
  return duels.filter((duel) => duel.goal && duel.attackingClubId === clubId).length;
}

export function decideResult(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals === awayGoals) {
    return 'EMPATE';
  }
  return homeGoals > awayGoals ? 'MANDANTE' : 'VISITANTE';
}
