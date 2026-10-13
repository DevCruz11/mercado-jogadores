import { z } from 'zod';
import { bodyId, brasiliaDateTime } from '../common/validation/field-schemas';

export const buyPlayerSchema = z.object({
  club_id: bodyId,
  loyalty_until: brasiliaDateTime,
});
export type BuyPlayerInput = z.output<typeof buyPlayerSchema>;
