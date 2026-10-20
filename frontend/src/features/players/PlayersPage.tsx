import { useMemo, useState } from 'react';
import { clubsApi } from '../../api/clubs-api';
import { playersApi } from '../../api/players-api';
import {
  BuyPayload,
  Condition,
  CreatePlayerPayload,
  Player,
  PurchaseResult,
  UpdatePlayerPayload,
} from '../../api/types';
import { ConditionBadge } from '../../components/ConditionBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Column, DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { ActionOutcome, useAction } from '../../hooks/useAction';
import { useApiResource } from '../../hooks/useApiResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatMoney } from '../../utils/format';
import { BuyForm } from './BuyForm';
import { ConditionForm } from './ConditionForm';
import { EMPTY_PLAYER_FILTERS, PlayerFilterValues, toPlayerFilters } from './player-filters';
import { PlayerFiltersBar } from './PlayerFiltersBar';
import { PlayerForm } from './PlayerForm';
import { PlayerSavedDialog } from './PlayerSavedDialog';
import { PurchaseResultDialog } from './PurchaseResultDialog';

const PAGE_SIZE = 10;
const FILTER_DELAY_MS = 350;

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; player: Player }
  | { kind: 'condition'; player: Player }
  | { kind: 'buy'; player: Player }
  | { kind: 'delete'; player: Player }
  | { kind: 'purchase'; result: PurchaseResult }
  | { kind: 'saved'; player: Player };

export function PlayersPage() {
  const [filterValues, setFilterValues] = useState<PlayerFilterValues>(EMPTY_PLAYER_FILTERS);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog>();

  const debouncedFilterValues = useDebouncedValue(filterValues, FILTER_DELAY_MS);
  const filters = useMemo(
    () => ({ ...toPlayerFilters(debouncedFilterValues), page, limit: PAGE_SIZE }),
    [debouncedFilterValues, page],
  );
  const players = useApiResource(() => playersApi.list(filters), JSON.stringify(filters));
  const clubs = useApiResource(() => clubsApi.list('name'), 'clubs');
  const clubById = useMemo(
    () => new Map((clubs.data ?? []).map((club) => [club.id, club])),
    [clubs.data],
  );

  const closeDialog = () => setDialog(undefined);
  const afterChange = () => {
    closeDialog();
    players.reload();
    clubs.reload();
  };
  const showSaved = (outcome: ActionOutcome<Player>) => {
    if (outcome.ok) {
      afterChange();
      setDialog({ kind: 'saved', player: outcome.result });
    }
  };

  const createPlayer = useAction(
    (payload: CreatePlayerPayload) => playersApi.create(payload),
    'Jogador cadastrado.',
  );
  const updatePlayer = useAction(
    (id: number, payload: UpdatePlayerPayload) => playersApi.update(id, payload),
    'Jogador atualizado.',
  );
  const changeCondition = useAction(
    (id: number, condition: Condition) => playersApi.changeCondition(id, condition),
    'Condição física atualizada.',
  );
  const removePlayer = useAction((id: number) => playersApi.remove(id), 'Jogador excluído.');
  const buyPlayer = useAction(
    (id: number, payload: BuyPayload) => playersApi.buy(id, payload),
    'Compra realizada.',
  );

  function changeFilters(values: PlayerFilterValues) {
    setFilterValues(values);
    setPage(1);
  }

  const columns: Column<Player>[] = [
    { header: 'Nome', render: (player) => player.name },
    { header: 'Posição', render: (player) => player.position },
    { header: 'Overall', render: (player) => player.overall, align: 'right' },
    { header: 'Agilidade', render: (player) => player.agility, align: 'right' },
    { header: 'Idade', render: (player) => player.age, align: 'right' },
    { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    { header: 'Valor base', render: (player) => formatMoney(player.base_value), align: 'right' },
    {
      header: 'Valor de mercado',
      render: (player) => formatMoney(player.market_value),
      align: 'right',
    },
    {
      header: 'Clube',
      render: (player) =>
        player.club_id === null ? (
          <span className="muted">Livre</span>
        ) : (
          (clubById.get(player.club_id)?.acronym ?? `#${player.club_id}`)
        ),
    },
    {
      header: 'Ações',
      render: (player) => (
        <div className="row-actions">
          <button
            type="button"
            className="button button--small"
            onClick={() => setDialog({ kind: 'edit', player })}
          >
            Editar
          </button>
          <button
            type="button"
            className="button button--small"
            onClick={() => setDialog({ kind: 'condition', player })}
          >
            Condição
          </button>
          {player.club_id === null && (
            <>
              <button
                type="button"
                className="button button--small button--primary"
                onClick={() => setDialog({ kind: 'buy', player })}
              >
                Comprar
              </button>
              <button
                type="button"
                className="button button--small button--danger"
                onClick={() => setDialog({ kind: 'delete', player })}
              >
                Excluir
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Jogadores"
        description="Cadastro, condição física e mercado. Valores calculados pela API."
        actions={
          <button
            type="button"
            className="button button--primary"
            onClick={() => setDialog({ kind: 'create' })}
          >
            + Cadastrar jogador
          </button>
        }
      />
      <PlayerFiltersBar values={filterValues} clubs={clubs.data ?? []} onChange={changeFilters} />
      <DataTable
        columns={columns}
        rows={players.data?.data}
        rowKey={(player) => player.id}
        loading={players.loading}
        error={players.error}
        emptyMessage="Nenhum jogador encontrado."
        onRetry={players.reload}
      />
      {players.data && (
        <Pagination
          page={players.data.meta.page}
          totalPages={players.data.meta.total_pages}
          totalItems={players.data.meta.total_items}
          onChange={setPage}
        />
      )}

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <PlayerForm
          player={dialog.kind === 'edit' ? dialog.player : undefined}
          pending={createPlayer.pending || updatePlayer.pending}
          onClose={closeDialog}
          onCreate={async (payload) => showSaved(await createPlayer.run(payload))}
          onUpdate={async (id, payload) => showSaved(await updatePlayer.run(id, payload))}
        />
      )}
      {dialog?.kind === 'condition' && (
        <ConditionForm
          player={dialog.player}
          pending={changeCondition.pending}
          onClose={closeDialog}
          onSubmit={async (condition) =>
            showSaved(await changeCondition.run(dialog.player.id, condition))
          }
        />
      )}
      {dialog?.kind === 'buy' && (
        <BuyForm
          player={dialog.player}
          clubs={clubs.data ?? []}
          pending={buyPlayer.pending}
          onClose={closeDialog}
          onSubmit={async (payload) => {
            const outcome = await buyPlayer.run(dialog.player.id, payload);
            if (outcome.ok) {
              afterChange();
              setDialog({ kind: 'purchase', result: outcome.result });
            }
          }}
        />
      )}
      {dialog?.kind === 'purchase' && (
        <PurchaseResultDialog
          result={dialog.result}
          clubs={clubs.data ?? []}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'saved' && (
        <PlayerSavedDialog player={dialog.player} onClose={closeDialog} />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Excluir jogador"
          confirmLabel="Excluir"
          tone="danger"
          pending={removePlayer.pending}
          onCancel={closeDialog}
          onConfirm={async () => {
            if ((await removePlayer.run(dialog.player.id)).ok) {
              afterChange();
            }
          }}
        >
          <p>
            Excluir <strong>{dialog.player.name}</strong>? Ele sai da lista, mas o histórico
            continua guardado.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
