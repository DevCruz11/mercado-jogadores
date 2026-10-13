import { Body, Controller, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { setLocation } from '../common/http/location';
import { ParseIdPipe } from '../common/validation/parse-id.pipe';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import {
  ListMatchesQuery,
  listMatchesQuerySchema,
  PlayMatchInput,
  playMatchSchema,
  SetLineupInput,
  setLineupSchema,
} from './league.schemas';
import { LineupResponse, LineupService } from './lineup.service';
import { MatchDetailResponse, MatchResponse } from './match.presenter';
import { MatchesService } from './matches.service';
import { StandingRow } from './standings';
import { StandingsService } from './standings.service';

@ApiTags('Liga')
@Controller()
export class LeagueController {
  constructor(
    private readonly lineupService: LineupService,
    private readonly matchesService: MatchesService,
    private readonly standingsService: StandingsService,
  ) {}

  @Get('clubs/:id/lineup')
  getLineup(@Param('id', ParseIdPipe) clubId: number): Promise<LineupResponse> {
    return this.lineupService.getLineup(clubId);
  }

  @Put('clubs/:id/lineup')
  setLineup(
    @Param('id', ParseIdPipe) clubId: number,
    @Body(new ZodValidationPipe(setLineupSchema)) input: SetLineupInput,
  ): Promise<LineupResponse> {
    return this.lineupService.setLineup(clubId, input);
  }

  @Post('matches')
  async playMatch(
    @Body(new ZodValidationPipe(playMatchSchema)) input: PlayMatchInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchDetailResponse> {
    const match = await this.matchesService.play(input);
    setLocation(response, `matches/${match.id}`);
    return match;
  }

  @Get('matches')
  listMatches(
    @Query(new ZodValidationPipe(listMatchesQuerySchema)) query: ListMatchesQuery,
  ): Promise<MatchResponse[]> {
    return this.matchesService.list(query);
  }

  @Get('matches/:id')
  findMatch(@Param('id', ParseIdPipe) id: number): Promise<MatchDetailResponse> {
    return this.matchesService.findById(id);
  }

  @Get('standings')
  getStandings(): Promise<StandingRow[]> {
    return this.standingsService.getStandings();
  }
}
