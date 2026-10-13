import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Player, Prisma } from '@prisma/client';
import { foldForComparison } from '../common/domain/text';
import { DatabaseClient, PrismaService } from '../prisma/prisma.service';
import { PlayerResponse, PlayerView, toPlayerResponse, toPlayerView } from './player.presenter';
import { compareByNameThenId, positionRank } from './player-ordering';
import { calculateBaseValue, calculateOverall } from './player-valuation';
import {
  ChangeConditionInput,
  CreatePlayerInput,
  ListPlayersQuery,
  PlayerSort,
  UpdatePlayerInput,
} from './players.schemas';

export interface PlayerPage {
  data: PlayerResponse[];
  meta: { page: number; limit: number; total_items: number; total_pages: number };
}

type PlayerComparator = (left: PlayerView, right: PlayerView) => number;

const PLAYER_COMPARATORS: Record<PlayerSort, PlayerComparator> = {
  name: () => 0,
  value_asc: (left, right) => left.marketValue.comparedTo(right.marketValue),
  value_desc: (left, right) => right.marketValue.comparedTo(left.marketValue),
  age_asc: (left, right) => left.player.age - right.player.age,
  age_desc: (left, right) => right.player.age - left.player.age,
  position: (left, right) =>
    positionRank(left.player.position) - positionRank(right.player.position),
};

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListPlayersQuery): Promise<PlayerPage> {
    if (query.club_id !== undefined) {
      await this.ensureClubExists(query.club_id);
    }
    const players = await this.prisma.player.findMany({ where: this.buildListFilter(query) });
    const matching = players
      .map(toPlayerView)
      .filter((view) => this.matchesSearch(view, query.search))
      .filter((view) => this.matchesValueRange(view, query))
      .sort(this.buildComparator(query.sort));

    const start = (query.page - 1) * query.limit;
    return {
      data: matching.slice(start, start + query.limit).map(toPlayerResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total_items: matching.length,
        total_pages: Math.ceil(matching.length / query.limit),
      },
    };
  }

  async findById(id: number): Promise<PlayerResponse> {
    return toPlayerResponse(toPlayerView(await this.findActiveOrFail(id)));
  }

  async create(input: CreatePlayerInput): Promise<PlayerResponse> {
    const overall = calculateOverall(input.position, input);
    const player = await this.prisma.player.create({
      data: { ...input, baseValue: calculateBaseValue(overall, input.potential, input.age) },
    });
    return toPlayerResponse(toPlayerView(player));
  }

  async update(id: number, input: UpdatePlayerInput): Promise<PlayerResponse> {
    const player = await this.findActiveOrFail(id);
    if (player.clubId !== null && input.position !== player.position) {
      throw new ConflictException('Jogador com clube não pode mudar de posição.');
    }
    if (input.age < player.age) {
      throw new ConflictException(`A idade não pode ser menor que a atual (${player.age}).`);
    }
    const updated = await this.prisma.player.update({ where: { id }, data: input });
    return toPlayerResponse(toPlayerView(updated));
  }

  async changeCondition(id: number, { condition }: ChangeConditionInput): Promise<PlayerResponse> {
    const player = await this.findActiveOrFail(id);
    if (player.condition === condition) {
      return toPlayerResponse(toPlayerView(player));
    }
    if (player.condition === 'DOENTE' && condition === 'APTO') {
      throw new ConflictException('Jogador DOENTE não pode passar direto para APTO.');
    }
    const updated = await this.prisma.$transaction(async (transaction) => {
      if (condition === 'DOENTE') {
        await transaction.lineupSlot.deleteMany({ where: { playerId: id } });
      }
      return transaction.player.update({ where: { id }, data: { condition } });
    });
    return toPlayerResponse(toPlayerView(updated));
  }

  async remove(id: number): Promise<void> {
    const player = await this.findActiveOrFail(id);
    if (player.clubId !== null) {
      throw new ConflictException('Só jogador livre pode ser excluído.');
    }
    await this.prisma.player.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findActiveOrFail(id: number, database: DatabaseClient = this.prisma): Promise<Player> {
    const player = await database.player.findFirst({ where: { id, deletedAt: null } });
    if (!player) {
      throw new NotFoundException(`Jogador ${id} não encontrado.`);
    }
    return player;
  }

  private async ensureClubExists(clubId: number): Promise<void> {
    const club = await this.prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
    if (!club) {
      throw new NotFoundException(`Clube ${clubId} não encontrado.`);
    }
  }

  private buildListFilter(query: ListPlayersQuery): Prisma.PlayerWhereInput {
    return {
      deletedAt: null,
      position: query.position,
      condition: query.condition,
      clubId: this.buildClubFilter(query),
      age: { gte: query.min_age, lte: query.max_age },
    };
  }

  private buildClubFilter(query: ListPlayersQuery): Prisma.PlayerWhereInput['clubId'] {
    if (query.club_id !== undefined) {
      return query.club_id;
    }
    if (query.free === undefined) {
      return undefined;
    }
    return query.free ? null : { not: null };
  }

  private matchesSearch(view: PlayerView, search: string | undefined): boolean {
    return (
      search === undefined ||
      foldForComparison(view.player.name).includes(foldForComparison(search))
    );
  }

  private matchesValueRange(view: PlayerView, query: ListPlayersQuery): boolean {
    const { marketValue } = view;
    return (
      (query.min_value === undefined || marketValue.greaterThanOrEqualTo(query.min_value)) &&
      (query.max_value === undefined || marketValue.lessThanOrEqualTo(query.max_value))
    );
  }

  private buildComparator(sorts: PlayerSort[]): PlayerComparator {
    const comparators = sorts.map((sort) => PLAYER_COMPARATORS[sort]);
    return (left, right) =>
      comparators.reduce((result, compare) => result || compare(left, right), 0) ||
      compareByNameThenId(left.player, right.player);
  }
}
