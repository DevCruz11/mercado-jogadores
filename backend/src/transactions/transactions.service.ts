import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { money, Money, toMoneyNumber } from '../common/domain/money';
import { ClubsService } from '../clubs/clubs.service';
import { PlayersService } from '../players/players.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionResponse, toTransactionResponse } from './transaction.presenter';
import { TransactionFilters } from './transactions.schemas';

export interface TransactionSummary {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

export interface TransactionHistory {
  data: TransactionResponse[];
  summary: TransactionSummary;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
    private readonly playersService: PlayersService,
  ) {}

  async findHistory(clubId: number, filters: TransactionFilters): Promise<Transaction[]> {
    await this.clubsService.findOrFail(clubId);
    if (filters.player_id !== undefined) {
      await this.playersService.findActiveOrFail(filters.player_id);
    }
    return this.prisma.transaction.findMany({
      where: { clubId, playerId: filters.player_id, type: { in: filters.type } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async getHistory(clubId: number, filters: TransactionFilters): Promise<TransactionHistory> {
    const transactions = await this.findHistory(clubId, filters);
    return { data: transactions.map(toTransactionResponse), summary: summarize(transactions) };
  }
}

function summarize(transactions: Transaction[]): TransactionSummary {
  const purchases = transactions.filter((transaction) => transaction.type === 'COMPRA');
  const sales = transactions.filter((transaction) => transaction.type === 'VENDA');
  const sum = (items: Transaction[], pick: (transaction: Transaction) => Money) =>
    toMoneyNumber(items.reduce((total, item) => total.plus(pick(item)), money(0)));

  return {
    total_spent: sum(purchases, (purchase) => money(purchase.value).plus(purchase.fee)),
    total_received: sum(sales, (sale) => money(sale.cashChange)),
    total_fees: sum(transactions, (transaction) => money(transaction.fee)),
    total_penalties: sum(sales, (sale) => money(sale.penalty)),
    total_profit: sum(sales, (sale) => money(sale.profit ?? 0)),
  };
}
