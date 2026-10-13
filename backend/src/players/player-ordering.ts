import { compareNames } from '../common/domain/text';
import { Position, POSITIONS } from './player.constants';

export interface NamedEntity {
  id: number;
  name: string;
}

export interface PositionedEntity extends NamedEntity {
  position: string;
}

export function positionRank(position: string): number {
  return POSITIONS.indexOf(position as Position);
}

export function compareByNameThenId(left: NamedEntity, right: NamedEntity): number {
  return compareNames(left.name, right.name) || left.id - right.id;
}

export function compareSquadOrder(left: PositionedEntity, right: PositionedEntity): number {
  return (
    positionRank(left.position) - positionRank(right.position) || compareByNameThenId(left, right)
  );
}
