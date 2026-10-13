import { FormEvent, useState } from 'react';
import { CreateClubPayload } from '../../api/types';
import { FormField } from '../../components/FormField';
import { Modal } from '../../components/Modal';
import {
  FieldErrors,
  FieldRule,
  hasErrors,
  required,
  textLength,
  validateFields,
} from '../../utils/validation';

type Field = 'name' | 'acronym';

const threeLetters: FieldRule = (value) =>
  /^[A-Za-z]{3}$/.test(value.trim()) ? undefined : 'Use exatamente 3 letras.';

interface ClubFormProps {
  pending: boolean;
  onSubmit: (payload: CreateClubPayload) => void;
  onClose: () => void;
}

export function ClubForm({ pending, onSubmit, onClose }: ClubFormProps) {
  const [values, setValues] = useState<Record<Field, string>>({ name: '', acronym: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateFields(values, {
      name: [required, textLength(3, 60)],
      acronym: [required, threeLetters],
    });
    setErrors(fieldErrors);
    if (!hasErrors(fieldErrors)) {
      onSubmit({ name: values.name, acronym: values.acronym.trim().toUpperCase() });
    }
  }

  return (
    <Modal
      title="Criar clube"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="club-form"
            className="button button--primary"
            disabled={pending}
          >
            {pending ? 'Salvando…' : 'Criar clube'}
          </button>
        </>
      }
    >
      <form id="club-form" className="form-grid" noValidate onSubmit={handleSubmit}>
        <FormField
          label="Nome"
          error={errors.name}
          hint="De 2 a 5 palavras, só letras, espaço, hífen e ponto."
        >
          {(props) => (
            <input
              {...props}
              className="input"
              value={values.name}
              maxLength={80}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
            />
          )}
        </FormField>
        <FormField
          label="Sigla"
          error={errors.acronym}
          hint="3 letras do nome, na ordem, começando pela primeira."
        >
          {(props) => (
            <input
              {...props}
              className="input input--uppercase"
              value={values.acronym}
              maxLength={3}
              onChange={(event) =>
                setValues((current) => ({ ...current, acronym: event.target.value }))
              }
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
