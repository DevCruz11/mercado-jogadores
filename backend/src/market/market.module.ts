import { Module } from '@nestjs/common';
import { ClubsModule } from '../clubs/clubs.module';
import { PlayersModule } from '../players/players.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [ClubsModule, PlayersModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
