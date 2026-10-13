import { money } from '../src/common/domain/money';
import {
  calculateLoyaltyPenalty,
  calculatePenaltyAmount,
  calculatePurchaseFee,
  calculateSaleCommission,
  isWithinPurchaseLimit,
} from '../src/market/market-rules';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

describe('compra (RN13)', () => {
  it.each([
    ['300.00', '28.00', '0.00', true],
    ['300.00', '30.00', '0.00', true],
    ['300.00', '30.01', '1.50', true],
    ['100.00', '47.62', '2.38', true],
    ['100.00', '48.00', '2.40', false],
  ])('caixa %s, valor %s → taxa %s, aceita %s', (cash, value, fee, accepted) => {
    const marketValue = money(value);
    const purchaseFee = calculatePurchaseFee(marketValue);
    expect(purchaseFee.toFixed(2)).toBe(fee);
    expect(isWithinPurchaseLimit(marketValue.plus(purchaseFee), cash)).toBe(accepted);
  });

  it('usa a metade exata do caixa, sem arredondar', () => {
    expect(isWithinPurchaseLimit(money('130.58'), '261.15')).toBe(false);
    expect(isWithinPurchaseLimit(money('130.57'), '261.15')).toBe(true);
  });
});

describe('multa por fidelidade (RN15)', () => {
  const sale = new Date('2026-11-05T19:40:00Z');

  it.each([
    [-DAY, 0, 0],
    [0, 0, 0],
    [10 * DAY + 2 * 60 * MINUTE, 11, 5],
    [30 * DAY, 30, 5],
    [30 * DAY + MINUTE, 31, 10],
    [180 * DAY, 180, 10],
    [180 * DAY + MINUTE, 181, 20],
    [200 * DAY, 200, 20],
  ])('fidelidade a %i ms → %i dias, %i%%', (offset, days, rate) => {
    const penalty = calculateLoyaltyPenalty(new Date(sale.getTime() + offset), sale);
    expect(penalty).toEqual({ remainingDays: days, rate });
  });

  it('arredonda os dias para cima (116 dias, 17h35 → 117)', () => {
    const loyaltyUntil = new Date('2027-03-02T13:15:00Z');
    expect(calculateLoyaltyPenalty(loyaltyUntil, sale)).toEqual({ remainingDays: 117, rate: 10 });
  });

  it('limita a multa a 10,00', () => {
    expect(calculatePenaltyAmount(money('75.00'), 20).toFixed(2)).toBe('10.00');
    expect(calculatePenaltyAmount(money('40.00'), 10).toFixed(2)).toBe('4.00');
  });
});

describe('comissão de venda (RN16)', () => {
  it.each([
    ['3.00', '0.30'],
    ['3.85', '0.39'],
    ['10.00', '1.00'],
    ['10.01', '1.00'],
    ['15.00', '2.00'],
    ['-7.50', '0.00'],
  ])('lucro %s → comissão %s', (profit, commission) => {
    expect(calculateSaleCommission(money(profit)).toFixed(2)).toBe(commission);
  });
});
