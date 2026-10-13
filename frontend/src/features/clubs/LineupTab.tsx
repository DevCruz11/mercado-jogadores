import { FormEvent, useState } from 'react';
import { clubsApi } from '../../api/clubs-api';
import { Formation, Lineup, LineupPayload, Player } from '../../api/types';
import { ConditionBadge } from '../../components/ConditionBadge';
import { Column, DataTable } from '../../components/DataTable';
import { FormField } from '../../components/FormField';
import { useAction } from '../../hooks/useAction';
import { useApiResource } from '../../hooks/useApiResource';
import { buildLineupSlots, FORMATIONS, LineupSlot } from './lineup-slots';

const lineupColumns: Column<Player>[] = [
  { header: 'Posição', render: (player) => player.position },
  { header: 'Nome', render: (player) => player.name },
  { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
  { header: 'Finalização', render: (player) => player.shooting, align: 'right' },
  { header: 'Passe', render: (player) => player.passing, align: 'right' },
  { header: 'Drible', render: (player) => player.dribbling, align: 'right' },
  { header: 'Defesa', render: (player) => player.defending, align: 'right' },
];

interface LineupTabProps {
  clubId: number;
  squad: Player[];
}

export function LineupTab({ clubId, squad }: LineupTabProps) {
  const lineup = useApiResource(() => clubsApi.lineup(clubId), String(clubId));
  const saveLineup = useAction(
    (payload: LineupPayload) => clubsApi.saveLineup(clubId, payload),
    'Escalação salva.',
  );

  return (
    <div className="lineup">
      <section>
        <h3>Escalação atual {lineup.data?.formation ? `(${lineup.data.formation})` : ''}</h3>
        {lineup.data && !lineup.data.complete && (
          <p className="alert alert--warning" role="alert">
            Escalação incompleta: o clube não pode jogar até escalar os 5 titulares.
          </p>
        )}
        <DataTable
          columns={lineupColumns}
          rows={lineup.data?.players}
          rowKey={(player) => player.id}
          loading={lineup.loading}
          error={lineup.error}
          emptyMessage="O clube ainda não escalou titulares."
          onRetry={lineup.reload}
        />
      </section>
      {lineup.data && (
        <LineupForm
          key={JSON.stringify(lineup.data)}
          lineup={lineup.data}
          squad={squad}
          pending={saveLineup.pending}
          onSubmit={async (payload) => {
            if ((await saveLineup.run(payload)).ok) {
              lineup.reload();
            }
          }}
        />
      )}
    </div>
  );
}

interface LineupFormProps {
  lineup: Lineup;
  squad: Player[];
  pending: boolean;
  onSubmit: (payload: LineupPayload) => void;
}

function LineupForm({ lineup, squad, pending, onSubmit }: LineupFormProps) {
  const [formation, setFormation] = useState<Formation | ''>(lineup.formation ?? '');
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    lineup.formation ? initialSelection(lineup.formation, lineup.players) : {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const available = squad.filter((player) => player.condition !== 'DOENTE');
  const slots = formation ? buildLineupSlots(formation) : [];

  function changeFormation(value: Formation | '') {
    setFormation(value);
    setSelection({});
    setErrors({});
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const slotErrors: Record<string, string> = formation
      ? {}
      : { formation: 'Escolha a formação.' };
    slots.forEach((slot) => {
      if (!selection[slot.key]) {
        slotErrors[slot.key] = 'Escolha um titular.';
      }
    });
    setErrors(slotErrors);
    if (Object.keys(slotErrors).length === 0 && formation) {
      onSubmit({ formation, player_ids: slots.map((slot) => Number(selection[slot.key])) });
    }
  }

  return (
    <form className="card lineup__form" noValidate onSubmit={handleSubmit}>
      <h3>Escalar titulares</h3>
      <FormField label="Formação" error={errors.formation}>
        {(props) => (
          <select
            {...props}
            className="input"
            value={formation}
            onChange={(event) => changeFormation(event.target.value as Formation | '')}
          >
            <option value="">Selecione</option>
            {FORMATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <div className="form-grid">
        {slots.map((slot) => (
          <FormField key={slot.key} label={slot.label} error={errors[slot.key]}>
            {(props) => (
              <select
                {...props}
                className="input"
                value={selection[slot.key] ?? ''}
                onChange={(event) =>
                  setSelection((current) => ({ ...current, [slot.key]: event.target.value }))
                }
              >
                <option value="">Selecione</option>
                {candidatesFor(slot, available, selection).map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.position} · {player.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        ))}
      </div>
      <button type="submit" className="button button--primary" disabled={pending}>
        {pending ? 'Salvando…' : 'Salvar escalação'}
      </button>
    </form>
  );
}

function candidatesFor(
  slot: LineupSlot,
  players: Player[],
  selection: Record<string, string>,
): Player[] {
  const takenElsewhere = new Set(
    Object.entries(selection)
      .filter(([key, value]) => key !== slot.key && value)
      .map(([, value]) => Number(value)),
  );
  return players.filter(
    (player) => slot.positions.includes(player.position) && !takenElsewhere.has(player.id),
  );
}

function initialSelection(formation: Formation, starters: Player[]): Record<string, string> {
  const remaining = [...starters];
  return Object.fromEntries(
    buildLineupSlots(formation).flatMap((slot) => {
      const index = remaining.findIndex((player) => slot.positions.includes(player.position));
      if (index < 0) {
        return [];
      }
      const [player] = remaining.splice(index, 1);
      return [[slot.key, String(player.id)]];
    }),
  );
}
