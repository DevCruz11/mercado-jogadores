import { useMemo, useState } from 'react';
import { clubsApi } from '../../api/clubs-api';
import { Transaction, TransactionFilters, TransactionType } from '../../api/types';
import { Column, DataTable } from '../../components/DataTable';
import { ResultSummary } from '../../components/ResultSummary';
import { useAction } from '../../hooks/useAction';
import { useApiResource } from '../../hooks/useApiResource';
import {
  formatDateTime,
  formatMoney,
  formatSignedMoney,
  TRANSACTION_TYPE_LABELS,
} from '../../utils/format';

const TRANSACTION_TYPES = Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[];
const NO_FILTERS: TransactionFilters = { types: [] };

const columns: Column<Transaction>[] = [
  { header: 'Data e hora', render: (transaction) => formatDateTime(transaction.created_at) },
  { header: 'Tipo', render: (transaction) => TRANSACTION_TYPE_LABELS[transaction.type] },
  { header: 'Jogador', render: (transaction) => transaction.player_name },
  { header: 'Valor', render: (transaction) => formatMoney(transaction.value), align: 'right' },
  {
    header: 'Taxa ou comissão',
    render: (transaction) => formatMoney(transaction.fee),
    align: 'right',
  },
  { header: 'Multa', render: (transaction) => formatMoney(transaction.penalty), align: 'right' },
  {
    header: 'Lucro',
    render: (transaction) => (transaction.profit === null ? '—' : formatMoney(transaction.profit)),
    align: 'right',
  },
  {
    header: 'Variação do caixa',
    render: (transaction) => (
      <span className={transaction.cash_change < 0 ? 'negative' : 'positive'}>
        {formatSignedMoney(transaction.cash_change)}
      </span>
    ),
    align: 'right',
  },
];

export function TransactionsTab({ clubId }: { clubId: number }) {
  const [filters, setFilters] = useState<TransactionFilters>(NO_FILTERS);
  const history = useApiResource(
    () => clubsApi.transactions(clubId, filters),
    JSON.stringify([clubId, filters]),
  );
  const allHistory = useApiResource(
    () => clubsApi.transactions(clubId, NO_FILTERS),
    String(clubId),
  );
  const playerOptions = useMemo(() => {
    const names = new Map(
      (allHistory.data?.data ?? []).map((item) => [item.player_id, item.player_name]),
    );
    return [...names.entries()].sort(([, left], [, right]) => left.localeCompare(right, 'pt-BR'));
  }, [allHistory.data]);
  const exportCsv = useAction(async () => {
    const file = await clubsApi.exportTransactions(clubId, filters);
    saveFile(file, `historico-clube-${clubId}.csv`);
  }, 'CSV exportado.');

  function toggleType(type: TransactionType) {
    setFilters((current) => ({
      ...current,
      types: current.types.includes(type)
        ? current.types.filter((item) => item !== type)
        : TRANSACTION_TYPES.filter((item) => item === type || current.types.includes(item)),
    }));
  }

  const summary = history.data?.summary;

  return (
    <>
      <section className="filters" aria-label="Filtros do histórico">
        <fieldset className="filters__item filters__checks">
          <legend>Tipo</legend>
          {TRANSACTION_TYPES.map((type) => (
            <label key={type} className="filters__item--check">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => toggleType(type)}
              />
              <span>{TRANSACTION_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </fieldset>
        <label className="filters__item">
          <span>Jogador</span>
          <select
            className="input"
            value={filters.player_id ?? ''}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                player_id: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
          >
            <option value="">Todos</option>
            {playerOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button button--primary filters__clear"
          disabled={exportCsv.pending}
          onClick={() => exportCsv.run()}
        >
          {exportCsv.pending ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </section>
      <DataTable
        columns={columns}
        rows={history.data?.data}
        rowKey={(transaction) => transaction.id}
        loading={history.loading}
        error={history.error}
        emptyMessage="Nenhuma transação encontrada."
        onRetry={history.reload}
      />
      {summary && !history.error && (
        <section className="summary" aria-label="Totais do histórico">
          <h3>
            Totais{' '}
            {filters.types.length > 0 || filters.player_id ? '(com os filtros aplicados)' : ''}
          </h3>
          <ResultSummary
            items={[
              { label: 'Total pago em compras', value: formatMoney(summary.total_spent) },
              { label: 'Total recebido em vendas', value: formatMoney(summary.total_received) },
              { label: 'Taxas e comissões', value: formatMoney(summary.total_fees) },
              { label: 'Multas', value: formatMoney(summary.total_penalties) },
              { label: 'Lucro total', value: formatSignedMoney(summary.total_profit) },
            ]}
          />
        </section>
      )}
    </>
  );
}

function saveFile(file: Blob, fileName: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
