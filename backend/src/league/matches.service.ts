import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from '@prisma/client';
import { ClubsService } from '../clubs/clubs.service';
import { Condition, Position } from '../players/player.constants';
import { PrismaService } from '../prisma/prisma.service';
import { ListMatchesQuery, PlayMatchInput } from './league.schemas';
import { Lineup, LineupService } from './lineup.service';
import { Duel, MatchPlayer, MatchTeam, playMatch } from './match-engine';
import {
  MatchDetailResponse,
  MatchResponse,
  toMatchDetailResponse,
  toMatchResponse,
} from './match.presenter';

const MATCH_CLUBS = { homeClub: true, awayClub: true } as const;

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clubsService: ClubsService,
    private readonly lineupService: LineupService,
  ) {}

  async play(input: PlayMatchInput): Promise<MatchDetailResponse> {
    const playedAt = new Date();
    const match = await this.prisma.$transaction(async (transaction) => {
      const home = await this.lineupService.loadLineup(input.home_club_id, transaction);
      const away = await this.lineupService.loadLineup(input.away_club_id, transaction);
      [home, away].forEach(ensureCompleteLineup);

      const outcome = playMatch(toMatchTeam(home), toMatchTeam(away));
      return transaction.match.create({
        data: {
          homeClubId: home.clubId,
          awayClubId: away.clubId,
          homeGoals: outcome.homeGoals,
          awayGoals: outcome.awayGoals,
          homeFormation: home.formation!,
          awayFormation: away.formation!,
          playedAt,
          duels: { create: outcome.duels.map(toDuelRecord) },
        },
        include: { ...MATCH_CLUBS, duels: true },
      });
    });
    return toMatchDetailResponse(match);
  }

  async list(query: ListMatchesQuery): Promise<MatchResponse[]> {
    if (query.club_id !== undefined) {
      await this.clubsService.findOrFail(query.club_id);
    }
    const matches = await this.prisma.match.findMany({
      where:
        query.club_id === undefined
          ? undefined
          : { OR: [{ homeClubId: query.club_id }, { awayClubId: query.club_id }] },
      include: MATCH_CLUBS,
      orderBy: [{ playedAt: 'desc' }, { id: 'desc' }],
    });
    return matches.map(toMatchResponse);
  }

  async findById(id: number): Promise<MatchDetailResponse> {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { ...MATCH_CLUBS, duels: true },
    });
    if (!match) {
      throw new NotFoundException(`Partida ${id} não encontrada.`);
    }
    return toMatchDetailResponse(match);
  }
}

function ensureCompleteLineup(lineup: Lineup): void {
  if (!lineup.complete) {
    throw new ConflictException(
      `O clube ${lineup.clubId} não tem a escalação completa, com os 5 titulares.`,
    );
  }
}

function toMatchTeam(lineup: Lineup): MatchTeam {
  return { clubId: lineup.clubId, starters: lineup.starters.map(toMatchPlayer) };
}

function toMatchPlayer(player: Player): MatchPlayer {
  return {
    id: player.id,
    name: player.name,
    position: player.position as Position,
    condition: player.condition as Condition,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
  };
}

function toDuelRecord(duel: Duel) {
  return {
    order: duel.order,
    attackingClubId: duel.attackingClubId,
    attackerId: duel.attacker.player.id,
    defenderId: duel.defender.player.id,
    attackerName: duel.attacker.player.name,
    defenderName: duel.defender.player.name,
    attackerPosition: duel.attacker.player.position,
    defenderPosition: duel.defender.player.position,
    attackerCondition: duel.attacker.player.condition,
    defenderCondition: duel.defender.player.condition,
    attackAttribute: duel.attacker.attribute,
    defenseAttribute: duel.defender.attribute,
    attackValue: duel.attacker.value,
    defenseValue: duel.defender.value,
    goal: duel.goal,
  };
}
