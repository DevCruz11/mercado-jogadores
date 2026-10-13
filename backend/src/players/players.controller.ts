import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { setLocation } from '../common/http/location';
import { ParseIdPipe } from '../common/validation/parse-id.pipe';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { PlayerResponse } from './player.presenter';
import {
  ChangeConditionInput,
  changeConditionSchema,
  CreatePlayerInput,
  createPlayerSchema,
  ListPlayersQuery,
  listPlayersQuerySchema,
  UpdatePlayerInput,
  updatePlayerSchema,
} from './players.schemas';
import { PlayerPage, PlayersService } from './players.service';

@ApiTags('Jogadores')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listPlayersQuerySchema)) query: ListPlayersQuery,
  ): Promise<PlayerPage> {
    return this.playersService.list(query);
  }

  @Get(':id')
  findById(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.playersService.findById(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createPlayerSchema)) input: CreatePlayerInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.playersService.create(input);
    setLocation(response, `players/${player.id}`);
    return player;
  }

  @Put(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body(new ZodValidationPipe(updatePlayerSchema)) input: UpdatePlayerInput,
  ): Promise<PlayerResponse> {
    return this.playersService.update(id, input);
  }

  @Patch(':id/condition')
  changeCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body(new ZodValidationPipe(changeConditionSchema)) input: ChangeConditionInput,
  ): Promise<PlayerResponse> {
    return this.playersService.changeCondition(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
