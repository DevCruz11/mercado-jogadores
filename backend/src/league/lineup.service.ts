import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Player, Prisma } from '@prisma/client';
import { ClubsService } from '../clubs/clubs.service';
import { Position } from '../players/player.constants';
import { PlayerResponse, toPlayerResponse, toPlayerView } from '../players/player.presenter';
import { compareSquadOrder } from '../players/player-ordering';
import { DatabaseClient, PrismaService } from '../prisma/prisma.service';
import { fitsFormation } from './formation-rules';
import { Formation, LINEUP_SIZE } from './league.constants';
import { SetLineupInput } from './league.schemas';

export interface Lineup {
  clubId: number;
  formation: Formation | null;
  starters: Player[];
  complete: boolean;
}

export interface LineupResponse {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: PlayerResponse[];
}

@Injectable()
export class LineupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
  ) {}

  async getLineup(clubId: number): Promise<LineupResponse> {
    return toLineupResponse(await this.loadLineup(clubId));
  }

  async setLineup(clubId: number, input: SetLineupInput): Promise<LineupResponse> {
    const lineup = await this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT id FROM clubes WHERE id = ${clubId} FOR UPDATE`;
      await this.clubsService.findOrFail(clubId, transaction);
      const starters = await this.findStarters(transaction, input.player_ids);
      this.ensureStartersFitLineup(clubId, input.formation, starters);

      await transaction.lineupSlot.deleteMany({ where: { clubId } });
      await transaction.lineupSlot.createMany({
        data: input.player_ids.map((playerId) => ({ clubId, playerId })),
      });
      await transaction.club.update({
        where: { id: clubId },
        data: { formation: input.formation },
      });
      return this.loadLineup(clubId, transaction);
    });
    return toLineupResponse(lineup);
  }

  async loadLineup(clubId: number, database: DatabaseClient = this.prisma): Promise<Lineup> {
    const club = await this.clubsService.findOrFail(clubId, database);
    const slots = await database.lineupSlot.findMany({
      where: { clubId },
      include: { player: true },
    });
    const starters = slots.map((slot) => slot.player).sort(compareSquadOrder);
    return {
      clubId,
      formation: club.formation as Formation | null,
      starters,
      complete: club.formation !== null && starters.length === LINEUP_SIZE,
    };
  }

  private async findStarters(
    transaction: Prisma.TransactionClient,
    playerIds: number[],
  ): Promise<Player[]> {
    const players = await transaction.player.findMany({
      where: { id: { in: playerIds }, deletedAt: null },
    });
    const missing = playerIds.find((id) => !players.some((player) => player.id === id));
    if (missing !== undefined) {
      throw new NotFoundException(`Jogador ${missing} não encontrado.`);
    }
    return players;
  }

  private ensureStartersFitLineup(clubId: number, formation: Formation, starters: Player[]): void {
    const outsider = starters.find((player) => player.clubId !== clubId);
    if (outsider) {
      throw new ConflictException(`${outsider.name} não é do elenco do clube.`);
    }
    const sick = starters.find((player) => player.condition === 'DOENTE');
    if (sick) {
      throw new ConflictException(`${sick.name} está DOENTE e não pode ser escalado.`);
    }
    if (
      !fitsFormation(
        formation,
        starters.map((player) => player.position as Position),
      )
    ) {
      throw new ConflictException(
        `As posições não fecham a formação ${formation}: são precisos 1 GOL e os jogadores de linha de cada setor.`,
      );
    }
  }
}

function toLineupResponse(lineup: Lineup): LineupResponse {
  return {
    club_id: lineup.clubId,
    formation: lineup.formation,
    complete: lineup.complete,
    players: lineup.starters.map((player) => toPlayerResponse(toPlayerView(player))),
  };
}
