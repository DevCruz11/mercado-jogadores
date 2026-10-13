import { Condition, PlayerFilters, PlayerSort, Position } from '../../api/types';

export interface PlayerFilterValues {
  search: string;
  position: string;
  condition: string;
  free: boolean;
  clubId: string;
  minAge: string;
  maxAge: string;
  minValue: string;
  maxValue: string;
  sort: PlayerSort;
}

export const EMPTY_PLAYER_FILTERS: PlayerFilterValues = {
  search: '',
  position: '',
  condition: '',
  free: false,
  clubId: '',
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
  sort: 'name',
};

const MIN_SEARCH_LENGTH = 2;

export function toPlayerFilters(values: PlayerFilterValues): PlayerFilters {
  const search = values.search.trim();
  return {
    search: search.length >= MIN_SEARCH_LENGTH ? search : undefined,
    position: (values.position || undefined) as Position | undefined,
    condition: (values.condition || undefined) as Condition | undefined,
    free: values.free || undefined,
    club_id: values.clubId ? Number(values.clubId) : undefined,
    min_age: toOptionalNumber(values.minAge),
    max_age: toOptionalNumber(values.maxAge),
    min_value: toOptionalNumber(values.minValue),
    max_value: toOptionalNumber(values.maxValue),
    sort: values.sort,
  };
}

function toOptionalNumber(text: string): number | undefined {
  return text.trim() === '' ? undefined : Number(text);
}
