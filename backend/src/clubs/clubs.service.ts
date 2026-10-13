import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Club } from '@prisma/client';
import { DatabaseClient, PrismaService } from '../prisma/prisma.service';
import { compareByNameThenId } from '../players/player-ordering';
import {
  ClubDetailResponse,
  ClubSummaryResponse,
  ClubValuation,
  toClubDetailResponse,
  toClubSummaryResponse,
  valueClub,
} from './club.presenter';
import { ClubSort, CreateClubInput } from './clubs.schemas';

const MAX_CLUBS = 20;

type ClubComparator = (left: ClubValuation, right: ClubValuation) => number;

const CLUB_COMPARATORS: Record<ClubSort, ClubComparator> = {
  name: () => 0,
  net_worth_asc: (left, right) => left.netWorth.comparedTo(right.netWorth),
  net_worth_desc: (left, right) => right.netWorth.comparedTo(left.netWorth),
};

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(sort: ClubSort): Promise<ClubSummaryResponse[]> {
    const clubs = await this.prisma.club.findMany({
      include: { players: { where: { deletedAt: null } } },
    });
    const compare = CLUB_COMPARATORS[sort];
    return clubs
      .map((club) => valueClub(club, club.players))
      .sort((left, right) => compare(left, right) || compareByNameThenId(left.club, right.club))
      .map(toClubSummaryResponse);
  }

  async findDetail(id: number): Promise<ClubDetailResponse> {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        players: { where: { deletedAt: null } },
        contracts: { where: { status: 'ATIVO' } },
      },
    });
    if (!club) {
      throw clubNotFound(id);
    }
    return toClubDetailResponse(valueClub(club, club.players), club.contracts, new Date());
  }

  async create(input: CreateClubInput): Promise<ClubSummaryResponse> {
    const normalizedName = input.name.toLowerCase();
    if ((await this.prisma.club.count()) >= MAX_CLUBS) {
      throw new ConflictException(`A liga aceita no máximo ${MAX_CLUBS} clubes.`);
    }
    if (await this.prisma.club.findUnique({ where: { normalizedName } })) {
      throw new ConflictException(`Já existe um clube com o nome "${input.name}".`);
    }
    if (await this.prisma.club.findUnique({ where: { acronym: input.acronym } })) {
      throw new ConflictException(`A sigla ${input.acronym} já está em uso.`);
    }
    const club = await this.prisma.club.create({ data: { ...input, normalizedName } });
    return toClubSummaryResponse(valueClub(club, []));
  }

  async findOrFail(id: number, database: DatabaseClient = this.prisma): Promise<Club> {
    const club = await database.club.findUnique({ where: { id } });
    if (!club) {
      throw clubNotFound(id);
    }
    return club;
  }
}

function clubNotFound(id: number): NotFoundException {
  return new NotFoundException(`Clube ${id} não encontrado.`);
}
