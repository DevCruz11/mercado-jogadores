import { z } from 'zod';
import { countWords } from '../common/domain/text';
import {
  integerInRange,
  normalizedText,
  queryBoolean,
  queryDecimal,
  queryId,
  queryInteger,
  queryText,
  textLength,
  MAX_ID,
} from '../common/validation/field-schemas';
import {
  ATTRIBUTES,
  CONDITIONS,
  FIXED_POTENTIAL_AGE,
  MAX_AGE,
  MAX_ATTRIBUTE_SUM,
  MIN_AGE,
  POSITIONS,
  VETERAN_AGE,
  VETERAN_MAX_AGILITY,
} from './player.constants';

const DIGIT = /[0-9]/;
const MAX_MARKET_VALUE_FILTER = 550;
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

export const PLAYER_SORTS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;
export type PlayerSort = (typeof PLAYER_SORTS)[number];

const playerName = normalizedText()
  .refine(textLength(3, 100), 'deve ter de 3 a 100 caracteres')
  .refine((name) => !DIGIT.test(name), 'não pode conter dígitos')
  .refine((name) => countWords(name) >= 2, 'deve ter pelo menos duas palavras');

const attribute = integerInRange(1, 99);

const editablePlayerFields = {
  name: playerName,
  position: z.enum(POSITIONS),
  agility: integerInRange(1, 100),
  age: integerInRange(MIN_AGE, MAX_AGE),
};

function refineVeteranAgility(
  player: { age: number; agility: number },
  context: z.core.$RefinementCtx,
): void {
  if (player.age >= VETERAN_AGE && player.agility > VETERAN_MAX_AGILITY) {
    context.addIssue({
      code: 'custom',
      path: ['agility'],
      message: `com ${VETERAN_AGE} anos ou mais, a agilidade máxima é ${VETERAN_MAX_AGILITY}`,
    });
  }
}

export const createPlayerSchema = z
  .object({
    ...editablePlayerFields,
    pace: attribute,
    shooting: attribute,
    passing: attribute,
    dribbling: attribute,
    defending: attribute,
    physical: attribute,
    potential: attribute,
  })
  .superRefine((player, context) => {
    refineVeteranAgility(player, context);
    const values = ATTRIBUTES.map((name) => player[name]);
    const highestAttribute = Math.max(...values);
    if (values.reduce((sum, value) => sum + value, 0) > MAX_ATTRIBUTE_SUM) {
      context.addIssue({
        code: 'custom',
        path: ['physical'],
        message: `a soma dos seis atributos não pode passar de ${MAX_ATTRIBUTE_SUM}`,
      });
    }
    if (player.potential < highestAttribute) {
      context.addIssue({
        code: 'custom',
        path: ['potential'],
        message: 'deve ser maior ou igual ao maior dos seis atributos',
      });
    }
    if (player.age >= FIXED_POTENTIAL_AGE && player.potential !== highestAttribute) {
      context.addIssue({
        code: 'custom',
        path: ['potential'],
        message: `com ${FIXED_POTENTIAL_AGE} anos ou mais, deve ser igual ao maior dos seis atributos`,
      });
    }
  });
export type CreatePlayerInput = z.output<typeof createPlayerSchema>;

export const updatePlayerSchema = z.object(editablePlayerFields).superRefine(refineVeteranAgility);
export type UpdatePlayerInput = z.output<typeof updatePlayerSchema>;

export const changeConditionSchema = z.object({ condition: z.enum(CONDITIONS) });
export type ChangeConditionInput = z.output<typeof changeConditionSchema>;

const sortField = (sort: string) => sort.replace(/_(asc|desc)$/, '');

const playerSortList = z
  .string()
  .transform((text) => text.split(','))
  .pipe(z.array(z.enum(PLAYER_SORTS)).min(1).max(2))
  .refine(
    (sorts) => new Set(sorts.map(sortField)).size === sorts.length,
    'não pode repetir o campo de ordenação',
  );

const ageFilter = queryInteger(MIN_AGE, MAX_AGE);
const valueFilter = queryDecimal(0, MAX_MARKET_VALUE_FILTER);

export const listPlayersQuerySchema = z
  .object({
    search: queryText.refine(textLength(2, 100), 'deve ter de 2 a 100 caracteres').optional(),
    position: z.enum(POSITIONS).optional(),
    condition: z.enum(CONDITIONS).optional(),
    free: queryBoolean.optional(),
    club_id: queryId.optional(),
    min_age: ageFilter.optional(),
    max_age: ageFilter.optional(),
    min_value: valueFilter.optional(),
    max_value: valueFilter.optional(),
    sort: playerSortList.default(['name']),
    page: queryInteger(1, MAX_ID).default(1),
    limit: queryInteger(1, MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  })
  .refine(
    (query) =>
      query.min_age === undefined || query.max_age === undefined || query.min_age <= query.max_age,
    { path: ['min_age'], message: 'não pode ser maior que max_age' },
  )
  .refine(
    (query) =>
      query.min_value === undefined ||
      query.max_value === undefined ||
      query.min_value <= query.max_value,
    { path: ['min_value'], message: 'não pode ser maior que max_value' },
  )
  .refine((query) => !(query.free === true && query.club_id !== undefined), {
    path: ['free'],
    message: 'free=true não pode ser combinado com club_id',
  });
export type ListPlayersQuery = z.output<typeof listPlayersQuerySchema>;
