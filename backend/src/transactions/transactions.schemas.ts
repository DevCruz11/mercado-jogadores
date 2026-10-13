import { z } from 'zod';
import { queryEnumList, queryId } from '../common/validation/field-schemas';
import { TRANSACTION_TYPES } from './transaction.constants';

export const transactionFiltersSchema = z.object({
  type: queryEnumList(TRANSACTION_TYPES).optional(),
  player_id: queryId.optional(),
});
export type TransactionFilters = z.output<typeof transactionFiltersSchema>;
