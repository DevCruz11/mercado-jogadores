import { Club, Match, MatchDuel } from '@prisma/client';
import { formatBrasiliaDateTime } from '../common/domain/date-time';
import { decideResult } from './match-engine';

export type MatchWithClubs = Match & { homeClub: Club; awayClub: Club };
export type MatchWithDuels = MatchWithClubs & { duels: MatchDuel[] };

interface MatchSideResponse {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

interface DuelParticipantResponse {
  player_id: number;
  player_name: string;
  position: string;
  condition: string;
  attribute: string;
  value: number;
}

export interface DuelResponse {
  order: number;
  attacking_club_id: number;
  attacker: DuelParticipantResponse;
  defender: DuelParticipantResponse;
  goal: boolean;
}

export interface MatchResponse {
  id: number;
  played_at: string;
  home: MatchSideResponse;
  away: MatchSideResponse;
  result: string;
}

export interface MatchDetailResponse extends MatchResponse {
  duels: DuelResponse[];
}

export function toMatchResponse(match: MatchWithClubs): MatchResponse {
  return {
    id: match.id,
    played_at: formatBrasiliaDateTime(match.playedAt),
    home: {
      club_id: match.homeClubId,
      club_name: match.homeClub.name,
      formation: match.homeFormation,
      goals: match.homeGoals,
    },
    away: {
      club_id: match.awayClubId,
      club_name: match.awayClub.name,
      formation: match.awayFormation,
      goals: match.awayGoals,
    },
    result: decideResult(match.homeGoals, match.awayGoals),
  };
}

export function toMatchDetailResponse(match: MatchWithDuels): MatchDetailResponse {
  return {
    ...toMatchResponse(match),
    duels: [...match.duels].sort((left, right) => left.order - right.order).map(toDuelResponse),
  };
}

function toDuelResponse(duel: MatchDuel): DuelResponse {
  return {
    order: duel.order,
    attacking_club_id: duel.attackingClubId,
    attacker: {
      player_id: duel.attackerId,
      player_name: duel.attackerName,
      position: duel.attackerPosition,
      condition: duel.attackerCondition,
      attribute: duel.attackAttribute,
      value: duel.attackValue,
    },
    defender: {
      player_id: duel.defenderId,
      player_name: duel.defenderName,
      position: duel.defenderPosition,
      condition: duel.defenderCondition,
      attribute: duel.defenseAttribute,
      value: duel.defenseValue,
    },
    goal: duel.goal,
  };
}
