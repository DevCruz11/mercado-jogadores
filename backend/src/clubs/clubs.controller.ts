import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { setLocation } from '../common/http/location';
import { ParseIdPipe } from '../common/validation/parse-id.pipe';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { ClubDetailResponse, ClubSummaryResponse } from './club.presenter';
import {
  CreateClubInput,
  createClubSchema,
  ListClubsQuery,
  listClubsQuerySchema,
} from './clubs.schemas';
import { ClubsService } from './clubs.service';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listClubsQuerySchema)) query: ListClubsQuery,
  ): Promise<ClubSummaryResponse[]> {
    return this.clubsService.list(query.sort);
  }

  @Get(':id')
  findDetail(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailResponse> {
    return this.clubsService.findDetail(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createClubSchema)) input: CreateClubInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubSummaryResponse> {
    const club = await this.clubsService.create(input);
    setLocation(response, `clubs/${club.id}`);
    return club;
  }
}
