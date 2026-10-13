import { Position } from '../players/player.constants';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;
export type Formation = (typeof FORMATIONS)[number];

type Sector = 'defense' | 'midfield' | 'attack';

export const FORMATION_SECTORS: Record<Formation, Record<Sector, number>> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

export const POSITION_SECTOR: Record<Exclude<Position, 'GOL'>, Sector> = {
  ZAG: 'defense',
  LAT: 'defense',
  MEI: 'midfield',
  ATA: 'attack',
};

export const LINEUP_SIZE = 5;
export const MATCH_RESULTS = ['MANDANTE', 'VISITANTE', 'EMPATE'] as const;
export type MatchResult = (typeof MATCH_RESULTS)[number];
