import Decimal from 'decimal.js';
import { money, Money, roundMoney } from '../common/domain/money';
import { ATTRIBUTES, Attributes, Condition, Position, POSITION_WEIGHTS } from './player.constants';

const MINIMUM_VALUE = money(1);
const CONDITION_DISCOUNT: Record<Condition, number> = { APTO: 0, MAL_CONDICIONADO: 15, DOENTE: 30 };
const HIGH_AGILITY = 80;
const LOW_AGILITY = 30;
const LOW_AGILITY_EXTRA_DISCOUNT = 10;
const YOUNG_AGE_LIMIT = 21;
const VETERAN_AGE_START = 32;
const AGE_ADJUSTMENT = 10;
const MAX_TOTAL_DISCOUNT = -40;

const OVERALL_VALUE_BANDS = [
  { from: 41, to: 60, valuePerPoint: money('0.50') },
  { from: 61, to: 75, valuePerPoint: money('2.00') },
  { from: 76, to: 99, valuePerPoint: money('6.00') },
];

export interface MarketValueInput {
  baseValue: Decimal.Value;
  condition: Condition;
  agility: number;
  age: number;
}

export function calculateOverall(position: Position, attributes: Attributes): number {
  const weights = POSITION_WEIGHTS[position];
  const weightedSum = ATTRIBUTES.reduce(
    (sum, attribute) => sum + attributes[attribute] * weights[attribute],
    0,
  );
  return Math.floor((weightedSum + 50) / 100);
}

export function calculateBaseValue(overall: number, potential: number, age: number): Money {
  let overallPart = OVERALL_VALUE_BANDS.reduce((sum, band) => {
    const points = Math.max(0, Math.min(overall, band.to) - band.from + 1);
    return sum.plus(band.valuePerPoint.times(points));
  }, money(0));
  if (isYoungProspect(age)) {
    overallPart = overallPart.times(100 + potential - overall).dividedBy(100);
  }
  return Decimal.max(roundMoney(overallPart), MINIMUM_VALUE);
}

export function calculateConditionDiscount(condition: Condition, agility: number): Decimal {
  const discount = money(CONDITION_DISCOUNT[condition]);
  if (condition === 'APTO') {
    return discount;
  }
  if (agility >= HIGH_AGILITY) {
    return discount.dividedBy(2);
  }
  if (agility <= LOW_AGILITY) {
    return discount.plus(LOW_AGILITY_EXTRA_DISCOUNT);
  }
  return discount;
}

export function calculateAgeAdjustment(age: number): number {
  if (isYoungProspect(age)) {
    return AGE_ADJUSTMENT;
  }
  return age >= VETERAN_AGE_START ? -AGE_ADJUSTMENT : 0;
}

export function calculateMarketValue({
  baseValue,
  condition,
  agility,
  age,
}: MarketValueInput): Money {
  const totalPercent = Decimal.max(
    money(calculateAgeAdjustment(age)).minus(calculateConditionDiscount(condition, agility)),
    MAX_TOTAL_DISCOUNT,
  );
  const marketValue = roundMoney(money(baseValue).times(totalPercent.plus(100)).dividedBy(100));
  return Decimal.max(marketValue, MINIMUM_VALUE);
}

function isYoungProspect(age: number): boolean {
  return age <= YOUNG_AGE_LIMIT;
}
