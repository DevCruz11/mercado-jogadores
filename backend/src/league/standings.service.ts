import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildStandings, StandingRow } from './standings';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStandings(): Promise<StandingRow[]> {
    const [clubs, matches] = await Promise.all([
      this.prisma.club.findMany(),
      this.prisma.match.findMany(),
    ]);
    return buildStandings(clubs, matches);
  }
}
