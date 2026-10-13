import { Module } from '@nestjs/common';
import { ClubsModule } from '../clubs/clubs.module';
import { LeagueController } from './league.controller';
import { LineupService } from './lineup.service';
import { MatchesService } from './matches.service';
import { StandingsService } from './standings.service';

@Module({
  imports: [ClubsModule],
  controllers: [LeagueController],
  providers: [LineupService, MatchesService, StandingsService],
})
export class LeagueModule {}
