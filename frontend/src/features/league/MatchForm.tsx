import { FormEvent, useState } from 'react';
import { Club, MatchPayload } from '../../api/types';
import { FormField } from '../../components/FormField';
import { FieldErrors, hasErrors, required, validateFields } from '../../utils/validation';

type Field = 'home' | 'away';

interface MatchFormProps {
  clubs: Club[];
  pending: boolean;
  onSubmit: (payload: MatchPayload) => void;
}

export function MatchForm({ clubs, pending, onSubmit }: MatchFormProps) {
  const [values, setValues] = useState<Record<Field, string>>({ home: '', away: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateFields(values, { home: [required], away: [required] });
    if (!fieldErrors.away && values.home === values.away) {
      fieldErrors.away = 'Escolha um visitante diferente do mandante.';
    }
    setErrors(fieldErrors);
    if (!hasErrors(fieldErrors)) {
      onSubmit({ home_club_id: Number(values.home), away_club_id: Number(values.away) });
    }
  }

  const clubSelect = (field: Field, label: string) => (
    <FormField label={label} error={errors[field]}>
      {(props) => (
        <select
          {...props}
          className="input"
          value={values[field]}
          onChange={(event) =>
            setValues((current) => ({ ...current, [field]: event.target.value }))
          }
        >
          <option value="">Selecione</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );

  return (
    <form className="card match-form" noValidate onSubmit={handleSubmit}>
      {clubSelect('home', 'Mandante')}
      <span className="match-form__versus">×</span>
      {clubSelect('away', 'Visitante')}
      <button type="submit" className="button button--primary" disabled={pending}>
        {pending ? 'Jogando…' : 'Jogar partida'}
      </button>
    </form>
  );
}
