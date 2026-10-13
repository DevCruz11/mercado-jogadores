import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '../common/validation/parse-id.pipe';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { BuyPlayerInput, buyPlayerSchema } from './market.schemas';
import { MarketService, PurchaseResponse, SaleResponse } from './market.service';

@ApiTags('Mercado')
@Controller('players/:id')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('buy')
  @HttpCode(200)
  buy(
    @Param('id', ParseIdPipe) playerId: number,
    @Body(new ZodValidationPipe(buyPlayerSchema)) input: BuyPlayerInput,
  ): Promise<PurchaseResponse> {
    return this.marketService.buy(playerId, input);
  }

  @Post('sell')
  @HttpCode(200)
  sell(@Param('id', ParseIdPipe) playerId: number): Promise<SaleResponse> {
    return this.marketService.sell(playerId);
  }
}
