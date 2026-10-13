import { Club, PlayerSort } from '../../api/types';
import { EMPTY_PLAYER_FILTERS, PlayerFilterValues } from './player-filters';
import { CONDITION_LABELS, POSITION_LABELS } from '../../utils/format';

const SORT_OPTIONS: { value: PlayerSort; label: string }[] = [
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'value_desc', label: 'Valor de mercado (maior primeiro)' },
  { value: 'value_asc', label: 'Valor de mercado (menor primeiro)' },
  { value: 'age_asc', label: 'Idade (mais novo primeiro)' },
  { value: 'age_desc', label: 'Idade (mais velho primeiro)' },
  { value: 'position', label: 'Posição (GOL → ATA)' },
];

interface PlayerFiltersBarProps {
  values: PlayerFilterValues;
  clubs: Club[];
  onChange: (values: PlayerFilterValues) => void;
}

export function PlayerFiltersBar({ values, clubs, onChange }: PlayerFiltersBarProps) {
  const update = <Key extends keyof PlayerFilterValues>(key: Key, value: PlayerFilterValues[Key]) =>
    onChange({ ...values, [key]: value });

  return (
    <section className="filters" aria-label="Filtros de jogadores">
      <label className="filters__item filters__item--wide">
        <span>Buscar por nome</span>
        <input
          className="input"
          type="search"
          placeholder="Ex.: joao"
          value={values.search}
          onChange={(event) => update('search', event.target.value)}
        />
      </label>
      <label className="filters__item">
        <span>Posição</span>
        <select
          className="input"
          value={values.position}
          onChange={(event) => update('position', event.target.value)}
        >
          <option value="">Todas</option>
          {Object.entries(POSITION_LABELS).map(([position, label]) => (
            <option key={position} value={position}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__item">
        <span>Condição</span>
        <select
          className="input"
          value={values.condition}
          onChange={(event) => update('condition', event.target.value)}
        >
          <option value="">Todas</option>
          {Object.entries(CONDITION_LABELS).map(([condition, label]) => (
            <option key={condition} value={condition}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__item">
        <span>Clube</span>
        <select
          className="input"
          value={values.clubId}
          disabled={values.free}
          title={values.free ? 'Desmarque "Só livres" para filtrar por clube.' : undefined}
          onChange={(event) => update('clubId', event.target.value)}
        >
          <option value="">Todos</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </label>
      <label className="filters__item filters__item--check">
        <input
          type="checkbox"
          checked={values.free}
          onChange={(event) => onChange({ ...values, free: event.target.checked, clubId: '' })}
        />
        <span>Só livres</span>
      </label>
      <RangeFilter
        label="Idade"
        min={values.minAge}
        max={values.maxAge}
        step="1"
        onMinChange={(value) => update('minAge', value)}
        onMaxChange={(value) => update('maxAge', value)}
      />
      <RangeFilter
        label="Valor de mercado"
        min={values.minValue}
        max={values.maxValue}
        step="0.01"
        onMinChange={(value) => update('minValue', value)}
        onMaxChange={(value) => update('maxValue', value)}
      />
      <label className="filters__item">
        <span>Ordenar por</span>
        <select
          className="input"
          value={values.sort}
          onChange={(event) => update('sort', event.target.value as PlayerSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="button button--ghost filters__clear"
        onClick={() => onChange(EMPTY_PLAYER_FILTERS)}
      >
        Limpar filtros
      </button>
    </section>
  );
}

interface RangeFilterProps {
  label: string;
  min: string;
  max: string;
  step: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

function RangeFilter({ label, min, max, step, onMinChange, onMaxChange }: RangeFilterProps) {
  return (
    <fieldset className="filters__item filters__range">
      <legend>{label}</legend>
      <input
        className="input"
        type="number"
        step={step}
        placeholder="mín."
        aria-label={`${label} mínimo`}
        value={min}
        onChange={(event) => onMinChange(event.target.value)}
      />
      <input
        className="input"
        type="number"
        step={step}
        placeholder="máx."
        aria-label={`${label} máximo`}
        value={max}
        onChange={(event) => onMaxChange(event.target.value)}
      />
    </fieldset>
  );
}
