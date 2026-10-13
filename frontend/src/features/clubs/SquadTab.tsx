import { useState } from 'react';
import { playersApi } from '../../api/players-api';
import { ClubDetail, SaleResult, SquadPlayer } from '../../api/types';
import { ConditionBadge } from '../../components/ConditionBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Column, DataTable } from '../../components/DataTable';
import { ResultDialog } from '../../components/ResultDialog';
import { useAction } from '../../hooks/useAction';
import { ApiResource } from '../../hooks/useApiResource';
import { formatDateTime, formatMoney } from '../../utils/format';

export function SquadTab({ club }: { club: ApiResource<ClubDetail> }) {
  const [selling, setSelling] = useState<SquadPlayer>();
  const [sale, setSale] = useState<SaleResult>();
  const sellPlayer = useAction((playerId: number) => playersApi.sell(playerId), 'Venda realizada.');

  const columns: Column<SquadPlayer>[] = [
    { header: 'Posição', render: (player) => player.position },
    { header: 'Nome', render: (player) => player.name },
    { header: 'Overall', render: (player) => player.overall, align: 'right' },
    { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    {
      header: 'Valor de mercado',
      render: (player) => formatMoney(player.market_value),
      align: 'right',
    },
    {
      header: 'Fim da fidelidade',
      render: (player) => (player.contract ? formatDateTime(player.contract.loyalty_until) : '—'),
    },
    {
      header: 'Dias restantes',
      render: (player) => player.contract?.remaining_days ?? '—',
      align: 'right',
    },
    {
      header: '% de multa',
      render: (player) => (player.contract ? `${player.contract.penalty_rate}%` : '—'),
      align: 'right',
    },
    {
      header: 'Ações',
      render: (player) => (
        <button
          type="button"
          className="button button--small button--danger"
          onClick={() => setSelling(player)}
        >
          Vender
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={club.data?.players}
        rowKey={(player) => player.id}
        loading={club.loading}
        error={club.error}
        emptyMessage="O clube ainda não tem jogadores. Compre jogadores livres na tela Jogadores."
        onRetry={club.reload}
      />
      {selling && (
        <ConfirmDialog
          title="Vender jogador"
          confirmLabel="Confirmar venda"
          tone="danger"
          pending={sellPlayer.pending}
          onCancel={() => setSelling(undefined)}
          onConfirm={async () => {
            const outcome = await sellPlayer.run(selling.id);
            setSelling(undefined);
            if (outcome.ok) {
              setSale(outcome.result);
            }
            club.reload();
          }}
        >
          <p>
            Vender <strong>{selling.name}</strong> pelo valor de mercado atual (
            {formatMoney(selling.market_value)})? A multa e a comissão são calculadas pela API.
          </p>
        </ConfirmDialog>
      )}
      {sale && (
        <ResultDialog
          title={`Venda de ${sale.player_name}`}
          onClose={() => setSale(undefined)}
          items={[
            { label: 'Valor de compra', value: formatMoney(sale.purchase_value) },
            { label: 'Valor de venda', value: formatMoney(sale.value) },
            { label: 'Dias restantes', value: sale.remaining_days },
            { label: 'Multa', value: `${formatMoney(sale.penalty)} (${sale.penalty_rate}%)` },
            { label: 'Lucro', value: formatMoney(sale.profit ?? 0) },
            { label: 'Comissão', value: formatMoney(sale.fee) },
            { label: 'Crédito no caixa', value: formatMoney(sale.cash_change) },
            { label: 'Novo caixa', value: formatMoney(sale.club_cash) },
          ]}
        />
      )}
    </>
  );
}
