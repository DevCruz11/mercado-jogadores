import { Condition } from '../api/types';
import { CONDITION_LABELS } from '../utils/format';

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className={`badge badge--${condition.toLowerCase()}`}>{CONDITION_LABELS[condition]}</span>
  );
}
