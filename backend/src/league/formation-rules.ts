import { Position } from '../players/player.constants';
import { Formation, FORMATION_SECTORS, POSITION_SECTOR } from './league.constants';

export function fitsFormation(formation: Formation, positions: Position[]): boolean {
  const goalkeepers = positions.filter((position) => position === 'GOL').length;
  if (goalkeepers !== 1) {
    return false;
  }
  const sectorCounts = { defense: 0, midfield: 0, attack: 0 };
  positions
    .filter((position) => position !== 'GOL')
    .forEach((position) => sectorCounts[POSITION_SECTOR[position as Exclude<Position, 'GOL'>]]++);
  const expected = FORMATION_SECTORS[formation];
  return (
    sectorCounts.defense === expected.defense &&
    sectorCounts.midfield === expected.midfield &&
    sectorCounts.attack === expected.attack
  );
}
