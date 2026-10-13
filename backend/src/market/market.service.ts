import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Contract, Player, Prisma } from '@prisma/client';
import { addDays, formatBrasiliaDateTime } from '../common/domain/date-time';
import { money, toMoneyNumber } from '../common/domain/money';
import { ClubsService } from '../clubs/clubs.service';
import { toPlayerView } from '../players/player.presenter';
import { PlayersService } from '../players/players.service';
import { PrismaService } from '../prisma/prisma.service';
import { CONTRACT_STATUS } from '../transactions/transaction.constants';
import { TransactionResponse, toTransactionResponse } from '../transactions/transaction.presenter';
import {
  calculateLoyaltyPenalty,
  calculatePenaltyAmount,
  calculatePurchaseFee,
  calculateSaleCommission,
  isWithinPurchaseLimit,
} from './market-rules';
import { BuyPlayerInput } from './market.schemas';

const MAX_SQUAD_SIZE = 12;
const MAX_LOYALTY_DAYS = 1095;

export interface PurchaseResponse extends TransactionResponse {
  contract: { purchase_value: number; loyalty_until: string; status: string };
  club_cash: number;
}

export interface SaleResponse extends TransactionResponse {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playersService: PlayersService,
    private readonly clubsService: ClubsService,
  ) {}

  buy(playerId: number, input: BuyPlayerInput): Promise<PurchaseResponse> {
    const now = new Date();
    return this.prisma.$transaction(async (transaction) => {
      const player = await this.lockPlayer(transaction, playerId);
      const club = await this.lockClub(transaction, input.club_id);
      this.ensureValidLoyaltyPeriod(input.loyalty_until, now);
      await this.ensurePlayerCanJoinClub(transaction, player, input.club_id);

      const value = toPlayerView(player).marketValue;
      const fee = calculatePurchaseFee(value);
      const totalCost = value.plus(fee);
      if (!isWithinPurchaseLimit(totalCost, club.cash)) {
        throw new ConflictException(
          `O custo da compra (${totalCost.toFixed(2)}) passa do limite de 50% do caixa (${money(club.cash).dividedBy(2).toString()}).`,
        );
      }

      const updatedClub = await transaction.club.update({
        where: { id: club.id },
        data: { cash: { decrement: totalCost } },
      });
      await transaction.player.update({ where: { id: player.id }, data: { clubId: club.id } });
      const contract = await transaction.contract.create({
        data: {
          playerId: player.id,
          clubId: club.id,
          purchaseValue: value,
          loyaltyUntil: input.loyalty_until,
          status: CONTRACT_STATUS.active,
          startedAt: now,
        },
      });
      const purchase = await transaction.transaction.create({
        data: {
          clubId: club.id,
          playerId: player.id,
          playerName: player.name,
          type: 'COMPRA',
          value,
          fee,
          penalty: 0,
          profit: null,
          cashChange: totalCost.negated(),
          createdAt: now,
        },
      });

      return {
        ...toTransactionResponse(purchase),
        contract: {
          purchase_value: toMoneyNumber(contract.purchaseValue),
          loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
          status: contract.status,
        },
        club_cash: toMoneyNumber(updatedClub.cash),
      };
    });
  }

  sell(playerId: number): Promise<SaleResponse> {
    const now = new Date();
    return this.prisma.$transaction(async (transaction) => {
      const player = await this.lockPlayer(transaction, playerId);
      if (player.clubId === null) {
        throw new ConflictException('Jogador livre não pode ser vendido.');
      }
      const contract = await this.findActiveContract(transaction, player.id, player.clubId);

      const value = toPlayerView(player).marketValue;
      const loyalty = calculateLoyaltyPenalty(contract.loyaltyUntil, now);
      const penalty = calculatePenaltyAmount(value, loyalty.rate);
      const profit = value.minus(contract.purchaseValue);
      const commission = calculateSaleCommission(profit);
      const credit = value.minus(penalty).minus(commission);
      const contractStatus =
        loyalty.rate > 0 ? CONTRACT_STATUS.terminated : CONTRACT_STATUS.finished;

      await transaction.contract.update({
        where: { id: contract.id },
        data: { status: contractStatus, endedAt: now },
      });
      const updatedClub = await transaction.club.update({
        where: { id: player.clubId },
        data: { cash: { increment: credit } },
      });
      await transaction.lineupSlot.deleteMany({ where: { playerId: player.id } });
      await transaction.player.update({ where: { id: player.id }, data: { clubId: null } });
      const sale = await transaction.transaction.create({
        data: {
          clubId: player.clubId,
          playerId: player.id,
          playerName: player.name,
          type: 'VENDA',
          value,
          fee: commission,
          penalty,
          profit,
          cashChange: credit,
          createdAt: now,
        },
      });

      return {
        ...toTransactionResponse(sale),
        purchase_value: toMoneyNumber(contract.purchaseValue),
        remaining_days: loyalty.remainingDays,
        penalty_rate: loyalty.rate,
        contract_status: contractStatus,
        club_cash: toMoneyNumber(updatedClub.cash),
      };
    });
  }

  private ensureValidLoyaltyPeriod(loyaltyUntil: Date, now: Date): void {
    if (loyaltyUntil <= now || loyaltyUntil > addDays(now, MAX_LOYALTY_DAYS)) {
      throw new BadRequestException(
        `O fim da fidelidade deve ser depois do momento da compra e até ${MAX_LOYALTY_DAYS} dias depois dele.`,
      );
    }
  }

  private async ensurePlayerCanJoinClub(
    transaction: Prisma.TransactionClient,
    player: Player,
    clubId: number,
  ): Promise<void> {
    if (player.clubId !== null) {
      throw new ConflictException('O jogador não está livre.');
    }
    const previousSale = await transaction.transaction.findFirst({
      where: { clubId, playerId: player.id, type: 'VENDA' },
      select: { id: true },
    });
    if (previousSale) {
      throw new ConflictException('O clube não pode comprar um jogador que ele mesmo já vendeu.');
    }
    const squadSize = await transaction.player.count({ where: { clubId } });
    if (squadSize >= MAX_SQUAD_SIZE) {
      throw new ConflictException(`O elenco já tem ${MAX_SQUAD_SIZE} jogadores.`);
    }
  }

  private async findActiveContract(
    transaction: Prisma.TransactionClient,
    playerId: number,
    clubId: number,
  ): Promise<Contract> {
    return transaction.contract.findFirstOrThrow({
      where: { playerId, clubId, status: CONTRACT_STATUS.active },
    });
  }

  private async lockPlayer(
    transaction: Prisma.TransactionClient,
    playerId: number,
  ): Promise<Player> {
    await transaction.$executeRaw`SELECT id FROM jogadores WHERE id = ${playerId} FOR UPDATE`;
    return this.playersService.findActiveOrFail(playerId, transaction);
  }

  private async lockClub(transaction: Prisma.TransactionClient, clubId: number) {
    await transaction.$executeRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
    return this.clubsService.findOrFail(clubId, transaction);
  }
}
