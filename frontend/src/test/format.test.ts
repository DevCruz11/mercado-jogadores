import {
  formatDateTime,
  formatMoney,
  formatSignedMoney,
  toBrasiliaApiDateTime,
} from '../utils/format';

describe('formatação', () => {
  it('mostra moedas com 2 casas e vírgula decimal', () => {
    expect(formatMoney(1234.5)).toBe('1.234,50');
    expect(formatMoney(37)).toBe('37,00');
  });

  it('mostra o sinal da variação do caixa', () => {
    expect(formatSignedMoney(35.7)).toBe('+35,70');
    expect(formatSignedMoney(-38.85)).toBe('-38,85');
  });

  it('mostra datas no horário de Brasília', () => {
    expect(formatDateTime('2026-11-05T16:40:00-03:00')).toBe('05/11/2026, 16:40');
  });

  it('envia a data digitada com o fuso -03:00', () => {
    expect(toBrasiliaApiDateTime('2027-03-02T10:15')).toBe('2027-03-02T10:15-03:00');
  });
});
