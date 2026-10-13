import Decimal from 'decimal.js';
import { MILLISECONDS_PER_DAY } from '../common/domain/date-time';
import { money, Money, percentOf, roundMoney } from '../common/domain/money';

const PURCHASE_FEE_PERCENT = 5;
const PURCHASE_FEE_THRESHOLD = money(30);
const PENALTY_CAP = money(10);
const COMMISSION_FIRST_BAND_LIMIT = money(10);
const COMMISSION_FIRST_BAND_PERCENT = 10;
const COMMISSION_SECOND_BAND_PERCENT = 20;

const PENALTY_RATE_BANDS = [
  { maxDays: 0, rate: 0 },
  { maxDays: 30, rate: 5 },
  { maxDays: 180, rate: 10 },
  { maxDays: Infinity, rate: 20 },
];

export interface LoyaltyPenalty {
  remainingDays: number;
  rate: number;
}

export function calculatePurchaseFee(marketValue: Money): Money {
  if (marketValue.lessThanOrEqualTo(PURCHASE_FEE_THRESHOLD)) {
    return money(0);
  }
  return roundMoney(percentOf(marketValue, PURCHASE_FEE_PERCENT));
}

export function isWithinPurchaseLimit(totalCost: Money, cash: Decimal.Value): boolean {
  return totalCost.times(2).lessThanOrEqualTo(cash);
}

export function calculateRemainingDays(loyaltyUntil: Date, moment: Date): number {
  const remaining = loyaltyUntil.getTime() - moment.getTime();
  return remaining > 0 ? Math.ceil(remaining / MILLISECONDS_PER_DAY) : 0;
}

export function calculateLoyaltyPenalty(loyaltyUntil: Date, moment: Date): LoyaltyPenalty {
  const remainingDays = calculateRemainingDays(loyaltyUntil, moment);
  const { rate } = PENALTY_RATE_BANDS.find((band) => remainingDays <= band.maxDays)!;
  return { remainingDays, rate };
}

export function calculatePenaltyAmount(marketValue: Money, rate: number): Money {
  return Decimal.min(roundMoney(percentOf(marketValue, rate)), PENALTY_CAP);
}

export function calculateSaleCommission(profit: Money): Money {
  if (profit.lessThanOrEqualTo(0)) {
    return money(0);
  }
  const firstBand = Decimal.min(profit, COMMISSION_FIRST_BAND_LIMIT);
  const secondBand = Decimal.max(profit.minus(COMMISSION_FIRST_BAND_LIMIT), 0);
  return roundMoney(
    percentOf(firstBand, COMMISSION_FIRST_BAND_PERCENT).plus(
      percentOf(secondBand, COMMISSION_SECOND_BAND_PERCENT),
    ),
  );
}
