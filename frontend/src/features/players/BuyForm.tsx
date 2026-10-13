import { FormEvent, useState } from 'react';
import { BuyPayload, Club, Player } from '../../api/types';
import { FormField } from '../../components/FormField';
import { Modal } from '../../components/Modal';
import { formatMoney, toBrasiliaApiDateTime } from '../../utils/format';
import { FieldErrors, hasErrors, required, validateFields } from '../../utils/validation';

type Field = 'clubId' | 'loyaltyUntil';

interface BuyFormProps {
  player: Player;
  clubs: Club[];
  pending: boolean;
  onSubmit: (payload: BuyPayload) => void;
  onClose: () => void;
}

export function BuyForm({ player, clubs, pending, onSubmit, onClose }: BuyFormProps) {
  const [values, setValues] = useState<Record<Field, string>>({ clubId: '', loyaltyUntil: '' });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validateFields(values, { clubId: [required], loyaltyUntil: [required] });
    setErrors(fieldErrors);
    if (hasErrors(fieldErrors)) {
      return;
    }
    onSubmit({
      club_id: Number(values.clubId),
      loyalty_until: toBrasiliaApiDateTime(values.loyaltyUntil),
    });
  }

  return (
    <Modal
      title={`Comprar ${player.name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="buy-form"
            className="button button--primary"
            disabled={pending}
          >
            {pending ? 'Comprando…' : 'Confirmar compra'}
          </button>
        </>
      }
    >
      <p className="muted">
        Valor de mercado atual: <strong>{formatMoney(player.market_value)}</strong>. A taxa e o
        limite de caixa são conferidos pela API.
      </p>
      <form id="buy-form" className="form-grid" noValidate onSubmit={handleSubmit}>
        <FormField label="Clube comprador" error={errors.clubId}>
          {(props) => (
            <select
              {...props}
              className="input"
              value={values.clubId}
              onChange={(event) =>
                setValues((current) => ({ ...current, clubId: event.target.value }))
              }
            >
              <option value="">Selecione</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.acronym}) · caixa {formatMoney(club.cash)}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          label="Fim da fidelidade"
          error={errors.loyaltyUntil}
          hint="Data e hora no horário de Brasília."
        >
          {(props) => (
            <input
              {...props}
              className="input"
              type="datetime-local"
              value={values.loyaltyUntil}
              onChange={(event) =>
                setValues((current) => ({ ...current, loyaltyUntil: event.target.value }))
              }
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
