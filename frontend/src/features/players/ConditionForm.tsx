import { FormEvent, useState } from 'react';
import { Condition, Player } from '../../api/types';
import { FormField } from '../../components/FormField';
import { Modal } from '../../components/Modal';
import { CONDITION_LABELS } from '../../utils/format';

const CONDITIONS = Object.keys(CONDITION_LABELS) as Condition[];

interface ConditionFormProps {
  player: Player;
  pending: boolean;
  onSubmit: (condition: Condition) => void;
  onClose: () => void;
}

export function ConditionForm({ player, pending, onSubmit, onClose }: ConditionFormProps) {
  const [condition, setCondition] = useState<Condition | ''>(player.condition);
  const [error, setError] = useState<string>();
  const sick = player.condition === 'DOENTE';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (condition === '') {
      setError('Campo obrigatório.');
      return;
    }
    setError(undefined);
    onSubmit(condition);
  }

  return (
    <Modal
      title={`Condição física de ${player.name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="condition-form"
            className="button button--primary"
            disabled={pending}
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="condition-form" noValidate onSubmit={handleSubmit}>
        <FormField
          label="Condição"
          error={error}
          hint={sick ? 'Jogador DOENTE não pode passar direto para APTO.' : undefined}
        >
          {(props) => (
            <select
              {...props}
              className="input"
              value={condition}
              onChange={(event) => setCondition(event.target.value as Condition)}
            >
              {CONDITIONS.map((option) => (
                <option key={option} value={option} disabled={sick && option === 'APTO'}>
                  {CONDITION_LABELS[option]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </form>
    </Modal>
  );
}
