import { z } from 'zod';
import { bodyId, queryId } from '../common/validation/field-schemas';
import { FORMATIONS, LINEUP_SIZE } from './league.constants';

export const setLineupSchema = z.object({
  formation: z.enum(FORMATIONS),
  player_ids: z
    .array(bodyId)
    .length(LINEUP_SIZE)
    .refine((ids) => new Set(ids).size === ids.length, 'não pode repetir jogadores'),
});
export type SetLineupInput = z.output<typeof setLineupSchema>;

export const playMatchSchema = z
  .object({
    home_club_id: bodyId,
    away_club_id: bodyId,
  })
  .refine((match) => match.home_club_id !== match.away_club_id, {
    path: ['away_club_id'],
    message: 'o visitante deve ser diferente do mandante',
  });
export type PlayMatchInput = z.output<typeof playMatchSchema>;

export const listMatchesQuerySchema = z.object({
  club_id: queryId.optional(),
});
export type ListMatchesQuery = z.output<typeof listMatchesQuerySchema>;
