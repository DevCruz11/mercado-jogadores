import { z } from 'zod';
import { countWords, removeAccents } from '../common/domain/text';
import { normalizedText, textLength } from '../common/validation/field-schemas';

const CLUB_NAME_CHARACTERS = /^[\p{L}\p{M} .-]+$/u;
const ACRONYM_FORMAT = /^[A-Z]{3}$/;
const LETTER = /\p{L}/u;

export const CLUB_SORTS = ['name', 'net_worth_asc', 'net_worth_desc'] as const;
export type ClubSort = (typeof CLUB_SORTS)[number];

const clubName = normalizedText()
  .refine(textLength(3, 60), 'deve ter de 3 a 60 caracteres')
  .refine((name) => CLUB_NAME_CHARACTERS.test(name), 'só aceita letras, espaços, hífen e ponto')
  .refine((name) => {
    const words = countWords(name);
    return words >= 2 && words <= 5;
  }, 'deve ter de 2 a 5 palavras');

export const createClubSchema = z
  .object({
    name: clubName,
    acronym: z
      .string()
      .regex(ACRONYM_FORMAT, 'deve ter exatamente 3 letras maiúsculas de A a Z')
      .refine((acronym) => new Set(acronym).size > 1, 'as três letras não podem ser iguais'),
  })
  .refine((club) => acronymMatchesName(club.acronym, club.name), {
    path: ['acronym'],
    message: 'deve usar letras do nome, na ordem, começando pela primeira letra do nome',
  });
export type CreateClubInput = z.output<typeof createClubSchema>;

export const listClubsQuerySchema = z.object({
  sort: z.enum(CLUB_SORTS).default('name'),
});
export type ListClubsQuery = z.output<typeof listClubsQuerySchema>;

function acronymMatchesName(acronym: string, name: string): boolean {
  const letters = [...removeAccents(name).toUpperCase()].filter((character) =>
    LETTER.test(character),
  );
  if (letters[0] !== acronym[0]) {
    return false;
  }
  let position = 1;
  for (const letter of acronym.slice(1)) {
    position = letters.indexOf(letter, position) + 1;
    if (position === 0) {
      return false;
    }
  }
  return true;
}
