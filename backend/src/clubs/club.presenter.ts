import { Club, Contract, Player } from '@prisma/client';
import { formatBrasiliaDateTime } from '../common/domain/date-time';
import { Money, money, toMoneyNumber } from '../common/domain/money';
import { calculateLoyaltyPenalty } from '../market/market-rules';
import {
  PlayerResponse,
  PlayerView,
  toPlayerResponse,
  toPlayerView,
} from '../players/player.presenter';
import { compareSquadOrder } from '../players/player-ordering';

export interface ClubSummaryResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface ContractResponse {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface SquadPlayerResponse extends PlayerResponse {
  contract: ContractResponse | null;
}

export interface ClubDetailResponse extends ClubSummaryResponse {
  players: SquadPlayerResponse[];
}

export interface ClubValuation {
  club: Club;
  squad: PlayerView[];
  squadValue: Money;
  netWorth: Money;
}

export function valueClub(club: Club, players: Player[]): ClubValuation {
  const squad = players
    .map(toPlayerView)
    .sort((left, right) => compareSquadOrder(left.player, right.player));
  const squadValue = squad.reduce((sum, view) => sum.plus(view.marketValue), money(0));
  return { club, squad, squadValue, netWorth: squadValue.plus(club.cash) };
}

export function toClubSummaryResponse({
  club,
  squadValue,
  netWorth,
}: ClubValuation): ClubSummaryResponse {
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: toMoneyNumber(club.cash),
    squad_value: toMoneyNumber(squadValue),
    net_worth: toMoneyNumber(netWorth),
  };
}

export function toClubDetailResponse(
  valuation: ClubValuation,
  activeContracts: Contract[],
  now: Date,
): ClubDetailResponse {
  const contractByPlayer = new Map(
    activeContracts.map((contract) => [contract.playerId, contract]),
  );
  return {
    ...toClubSummaryResponse(valuation),
    players: valuation.squad.map((view) => ({
      ...toPlayerResponse(view),
      contract: toContractResponse(contractByPlayer.get(view.player.id), now),
    })),
  };
}

function toContractResponse(contract: Contract | undefined, now: Date): ContractResponse | null {
  if (!contract) {
    return null;
  }
  const penalty = calculateLoyaltyPenalty(contract.loyaltyUntil, now);
  return {
    purchase_value: toMoneyNumber(contract.purchaseValue),
    loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
    remaining_days: penalty.remainingDays,
    penalty_rate: penalty.rate,
  };
}
