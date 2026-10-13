import { Player } from '@prisma/client';
import { Money, toMoneyNumber } from '../common/domain/money';
import { Condition, Position } from './player.constants';
import { calculateMarketValue, calculateOverall } from './player-valuation';

export interface PlayerView {
  player: Player;
  overall: number;
  marketValue: Money;
}

export interface PlayerResponse {
  id: number;
  name: string;
  position: string;
  agility: number;
  age: number;
  condition: string;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export function toPlayerView(player: Player): PlayerView {
  return {
    player,
    overall: calculateOverall(player.position as Position, player),
    marketValue: calculateMarketValue({
      baseValue: player.baseValue,
      condition: player.condition as Condition,
      agility: player.agility,
      age: player.age,
    }),
  };
}

export function toPlayerResponse({ player, overall, marketValue }: PlayerView): PlayerResponse {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    agility: player.agility,
    age: player.age,
    condition: player.condition,
    base_value: toMoneyNumber(player.baseValue),
    market_value: toMoneyNumber(marketValue),
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
    overall,
    club_id: player.clubId,
  };
}
