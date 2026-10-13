export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';
export type Condition = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';
export type TransactionType = 'COMPRA' | 'VENDA';
export type Formation = '3-1' | '2-2' | '2-1-1' | '1-2-1';
export type PlayerSort = 'name' | 'value_asc' | 'value_desc' | 'age_asc' | 'age_desc' | 'position';
export type ClubSort = 'name' | 'net_worth_asc' | 'net_worth_desc';

export interface Player {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
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

export interface PlayerPage {
  data: Player[];
  meta: { page: number; limit: number; total_items: number; total_pages: number };
}

export interface PlayerFilters {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
  sort?: PlayerSort;
  page?: number;
  limit?: number;
}

export interface CreatePlayerPayload {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}

export type UpdatePlayerPayload = Pick<
  CreatePlayerPayload,
  'name' | 'position' | 'agility' | 'age'
>;

export interface Club {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface Contract {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface SquadPlayer extends Player {
  contract: Contract | null;
}

export interface ClubDetail extends Club {
  players: SquadPlayer[];
}

export interface CreateClubPayload {
  name: string;
  acronym: string;
}

export interface Transaction {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface TransactionSummary {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

export interface TransactionHistory {
  data: Transaction[];
  summary: TransactionSummary;
}

export interface TransactionFilters {
  types: TransactionType[];
  player_id?: number;
}

export interface BuyPayload {
  club_id: number;
  loyalty_until: string;
}

export interface PurchaseResult extends Transaction {
  contract: { purchase_value: number; loyalty_until: string; status: string };
  club_cash: number;
}

export interface SaleResult extends Transaction {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}

export interface Lineup {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: Player[];
}

export interface LineupPayload {
  formation: Formation;
  player_ids: number[];
}

export interface MatchSide {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

export interface DuelParticipant {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: string;
  value: number;
}

export interface Duel {
  order: number;
  attacking_club_id: number;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export interface Match {
  id: number;
  played_at: string;
  home: MatchSide;
  away: MatchSide;
  result: 'MANDANTE' | 'VISITANTE' | 'EMPATE';
}

export interface MatchDetail extends Match {
  duels: Duel[];
}

export interface MatchPayload {
  home_club_id: number;
  away_club_id: number;
}

export interface Standing {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
