import { Module } from '@nestjs/common';
import { ClubsModule } from './clubs/clubs.module';
import { LeagueModule } from './league/league.module';
import { MarketModule } from './market/market.module';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    PlayersModule,
    ClubsModule,
    MarketModule,
    TransactionsModule,
    LeagueModule,
  ],
})
export class AppModule {}
