import { Transaction } from '@prisma/client';
import Decimal from 'decimal.js';
import { formatBrasiliaDateTime } from '../common/domain/date-time';

const SEPARATOR = ';';
const LINE_END = '\n';
const QUOTE = '"';
const HEADER = [
  'data_hora',
  'tipo',
  'jogador',
  'valor',
  'taxa_ou_comissao',
  'multa',
  'lucro',
  'variacao_caixa',
].join(SEPARATOR);

export function toTransactionsCsv(transactions: Transaction[]): string {
  const rows = transactions.map((transaction) =>
    [
      formatBrasiliaDateTime(transaction.createdAt),
      transaction.type,
      escapeCsvText(transaction.playerName),
      formatCsvMoney(transaction.value),
      formatCsvMoney(transaction.fee),
      formatCsvMoney(transaction.penalty),
      transaction.profit === null ? '' : formatCsvMoney(transaction.profit),
      formatCsvMoney(transaction.cashChange),
    ].join(SEPARATOR),
  );
  return [HEADER, ...rows].map((line) => line + LINE_END).join('');
}

function formatCsvMoney(value: Decimal.Value): string {
  return new Decimal(value).toFixed(2).replace('.', ',');
}

function escapeCsvText(text: string): string {
  if (!text.includes(SEPARATOR) && !text.includes(QUOTE)) {
    return text;
  }
  return QUOTE + text.replaceAll(QUOTE, QUOTE + QUOTE) + QUOTE;
}
