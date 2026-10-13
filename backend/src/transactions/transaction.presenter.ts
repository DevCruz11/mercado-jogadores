import { Transaction } from '@prisma/client';
import { formatBrasiliaDateTime } from '../common/domain/date-time';
import { toMoneyNumber } from '../common/domain/money';

export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: string;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export function toTransactionResponse(transaction: Transaction): TransactionResponse {
  return {
    id: transaction.id,
    club_id: transaction.clubId,
    player_id: transaction.playerId,
    player_name: transaction.playerName,
    type: transaction.type,
    value: toMoneyNumber(transaction.value),
    fee: toMoneyNumber(transaction.fee),
    penalty: toMoneyNumber(transaction.penalty),
    profit: transaction.profit === null ? null : toMoneyNumber(transaction.profit),
    cash_change: toMoneyNumber(transaction.cashChange),
    created_at: formatBrasiliaDateTime(transaction.createdAt),
  };
}
