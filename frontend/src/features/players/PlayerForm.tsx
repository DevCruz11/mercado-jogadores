import { FormEvent, useState } from 'react';
import { CreatePlayerPayload, Player, Position, UpdatePlayerPayload } from '../../api/types';
import { FormField } from '../../components/FormField';
import { Modal } from '../../components/Modal';
import { POSITION_LABELS } from '../../utils/format';
import {
  FieldErrors,
  FieldRule,
  hasErrors,
  integerRange,
  required,
  textLength,
  validateFields,
} from '../../utils/validation';

const POSITIONS = Object.keys(POSITION_LABELS) as Position[];

const ATTRIBUTE_FIELDS = [
  { field: 'pace', label: 'Velocidade' },
  { field: 'shooting', label: 'Finalização' },
  { field: 'passing', label: 'Passe' },
  { field: 'dribbling', label: 'Drible' },
  { field: 'defending', label: 'Defesa' },
  { field: 'physical', label: 'Físico' },
  { field: 'potential', label: 'Potencial' },
] as const;

type AttributeField = (typeof ATTRIBUTE_FIELDS)[number]['field'];
type Field = 'name' | 'position' | 'agility' | 'age' | AttributeField;
type Values = Record<Field, string>;

const BASE_RULES: Partial<Record<Field, FieldRule[]>> = {
  name: [required, textLength(3, 100)],
  position: [required],
  agility: [required, integerRange(1, 100)],
  age: [required, integerRange(16, 45)],
};

const ATTRIBUTE_RULES = Object.fromEntries(
  ATTRIBUTE_FIELDS.map(({ field }) => [field, [required, integerRange(1, 99)]]),
) as Record<AttributeField, FieldRule[]>;

interface PlayerFormProps {
  player?: Player;
  pending: boolean;
  onCreate: (payload: CreatePlayerPayload) => void;
  onUpdate: (id: number, payload: UpdatePlayerPayload) => void;
  onClose: () => void;
}

export function PlayerForm({ player, pending, onCreate, onUpdate, onClose }: PlayerFormProps) {
  const editing = player !== undefined;
  const hasClub = player?.club_id !== null && player?.club_id !== undefined;
  const [values, setValues] = useState<Values>(() => initialValues(player));
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const setValue = (field: Field, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  function validate(): FieldErrors<Field> {
    const fieldErrors = validateFields(
      values,
      editing ? BASE_RULES : { ...BASE_RULES, ...ATTRIBUTE_RULES },
    );
    if (editing && !fieldErrors.age && Number(values.age) < player.age) {
      fieldErrors.age = `A idade não pode ser menor que a atual (${player.age}).`;
    }
    return fieldErrors;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (hasErrors(fieldErrors)) {
      return;
    }
    const basePayload: UpdatePlayerPayload = {
      name: values.name,
      position: values.position as Position,
      agility: Number(values.agility),
      age: Number(values.age),
    };
    if (editing) {
      onUpdate(player.id, basePayload);
      return;
    }
    const attributes = Object.fromEntries(
      ATTRIBUTE_FIELDS.map(({ field }) => [field, Number(values[field])]),
    ) as Record<AttributeField, number>;
    onCreate({ ...basePayload, ...attributes });
  }

  return (
    <Modal
      title={editing ? `Editar ${player.name}` : 'Cadastrar jogador'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="player-form"
            className="button button--primary"
            disabled={pending}
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="player-form" className="form-grid" noValidate onSubmit={handleSubmit}>
        <FormField label="Nome" error={errors.name}>
          {(props) => (
            <input
              {...props}
              className="input"
              value={values.name}
              maxLength={120}
              onChange={(event) => setValue('name', event.target.value)}
            />
          )}
        </FormField>
        <FormField
          label="Posição"
          error={errors.position}
          hint={hasClub ? 'Jogador com clube não muda de posição.' : undefined}
        >
          {(props) => (
            <select
              {...props}
              className="input"
              value={values.position}
              disabled={hasClub}
              onChange={(event) => setValue('position', event.target.value)}
            >
              <option value="">Selecione</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position} · {POSITION_LABELS[position]}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <NumberField
          label="Agilidade (1 a 100)"
          field="agility"
          values={values}
          errors={errors}
          onChange={setValue}
        />
        <NumberField
          label="Idade (16 a 45)"
          field="age"
          values={values}
          errors={errors}
          onChange={setValue}
        />
        {!editing && (
          <fieldset className="form-grid__group">
            <legend>Indicadores técnicos (1 a 99)</legend>
            {ATTRIBUTE_FIELDS.map(({ field, label }) => (
              <NumberField
                key={field}
                label={label}
                field={field}
                values={values}
                errors={errors}
                onChange={setValue}
              />
            ))}
          </fieldset>
        )}
      </form>
    </Modal>
  );
}

interface NumberFieldProps {
  label: string;
  field: Field;
  values: Values;
  errors: FieldErrors<Field>;
  onChange: (field: Field, value: string) => void;
}

function NumberField({ label, field, values, errors, onChange }: NumberFieldProps) {
  return (
    <FormField label={label} error={errors[field]}>
      {(props) => (
        <input
          {...props}
          className="input"
          type="number"
          inputMode="numeric"
          value={values[field]}
          onChange={(event) => onChange(field, event.target.value)}
        />
      )}
    </FormField>
  );
}

function initialValues(player?: Player): Values {
  return {
    name: player?.name ?? '',
    position: player?.position ?? '',
    agility: player ? String(player.agility) : '',
    age: player ? String(player.age) : '',
    pace: '',
    shooting: '',
    passing: '',
    dribbling: '',
    defending: '',
    physical: '',
    potential: '',
  };
}
