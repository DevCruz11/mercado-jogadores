import { Formation, Position } from '../../api/types';

export interface LineupSlot {
  key: string;
  label: string;
  positions: Position[];
}

export const FORMATIONS: Formation[] = ['3-1', '2-2', '2-1-1', '1-2-1'];

const SECTORS: { label: string; positions: Position[]; index: number }[] = [
  { label: 'Defesa', positions: ['ZAG', 'LAT'], index: 0 },
  { label: 'Meio', positions: ['MEI'], index: 1 },
  { label: 'Ataque', positions: ['ATA'], index: 2 },
];

const SECTOR_COUNTS: Record<Formation, [number, number, number]> = {
  '3-1': [3, 0, 1],
  '2-2': [2, 0, 2],
  '2-1-1': [2, 1, 1],
  '1-2-1': [1, 2, 1],
};

export function buildLineupSlots(formation: Formation): LineupSlot[] {
  const goalkeeper: LineupSlot = { key: 'GOL-1', label: 'Goleiro', positions: ['GOL'] };
  const outfield = SECTORS.flatMap((sector) =>
    Array.from({ length: SECTOR_COUNTS[formation][sector.index] }, (_, index) => ({
      key: `${sector.label}-${index + 1}`,
      label: `${sector.label} ${index + 1}`,
      positions: sector.positions,
    })),
  );
  return [goalkeeper, ...outfield];
}
