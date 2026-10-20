import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiZodQuery } from '../common/http/openapi';
import { ParseIdPipe } from '../common/validation/parse-id.pipe';
import { ZodValidationPipe } from '../common/validation/zod-validation.pipe';
import { toTransactionsCsv } from './transactions-csv';
import { TransactionFilters, transactionFiltersSchema } from './transactions.schemas';
import { TransactionHistory, TransactionsService } from './transactions.service';

@ApiTags('Mercado')
@Controller('clubs/:id/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiZodQuery(transactionFiltersSchema)
  getHistory(
    @Param('id', ParseIdPipe) clubId: number,
    @Query(new ZodValidationPipe(transactionFiltersSchema)) filters: TransactionFilters,
  ): Promise<TransactionHistory> {
    return this.transactionsService.getHistory(clubId, filters);
  }

  @Get('export')
  @ApiZodQuery(transactionFiltersSchema)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="historico-transacoes.csv"')
  async exportCsv(
    @Param('id', ParseIdPipe) clubId: number,
    @Query(new ZodValidationPipe(transactionFiltersSchema)) filters: TransactionFilters,
  ): Promise<string> {
    return toTransactionsCsv(await this.transactionsService.findHistory(clubId, filters));
  }
}
