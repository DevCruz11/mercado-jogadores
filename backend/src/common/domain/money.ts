import Decimal from 'decimal.js';

export type Money = Decimal;

export const ZERO_MONEY = new Decimal(0);

export function money(value: Decimal.Value): Money {
  return new Decimal(value);
}

export function roundMoney(value: Decimal.Value): Money {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function toMoneyNumber(value: Decimal.Value): number {
  return Number(new Decimal(value).toFixed(2));
}

export function percentOf(value: Decimal.Value, percent: Decimal.Value): Money {
  return new Decimal(value).times(percent).dividedBy(100);
}
