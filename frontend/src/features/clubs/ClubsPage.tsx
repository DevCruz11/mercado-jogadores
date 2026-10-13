import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clubsApi } from '../../api/clubs-api';
import { Club, ClubSort, CreateClubPayload } from '../../api/types';
import { Column, DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { useAction } from '../../hooks/useAction';
import { useApiResource } from '../../hooks/useApiResource';
import { formatMoney } from '../../utils/format';
import { ClubForm } from './ClubForm';

const SORT_OPTIONS: { value: ClubSort; label: string }[] = [
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'net_worth_desc', label: 'Patrimônio (maior primeiro)' },
  { value: 'net_worth_asc', label: 'Patrimônio (menor primeiro)' },
];

export function ClubsPage() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<ClubSort>('name');
  const [creating, setCreating] = useState(false);
  const clubs = useApiResource(() => clubsApi.list(sort), sort);
  const createClub = useAction(
    (payload: CreateClubPayload) => clubsApi.create(payload),
    'Clube criado.',
  );

  const columns: Column<Club>[] = [
    { header: 'Nome', render: (club) => club.name },
    { header: 'Sigla', render: (club) => club.acronym },
    { header: 'Caixa', render: (club) => formatMoney(club.cash), align: 'right' },
    { header: 'Valor do elenco', render: (club) => formatMoney(club.squad_value), align: 'right' },
    { header: 'Patrimônio', render: (club) => formatMoney(club.net_worth), align: 'right' },
    {
      header: 'Ações',
      render: (club) => (
        <button
          type="button"
          className="button button--small"
          onClick={() => navigate(`/clubs/${club.id}`)}
        >
          Abrir
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Clubes"
        description="Cada clube começa com 300,00 em caixa. A liga aceita até 20 clubes."
        actions={
          <button
            type="button"
            className="button button--primary"
            onClick={() => setCreating(true)}
          >
            + Criar clube
          </button>
        }
      />
      <section className="filters">
        <label className="filters__item">
          <span>Ordenar por</span>
          <select
            className="input"
            value={sort}
            onChange={(event) => setSort(event.target.value as ClubSort)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>
      <DataTable
        columns={columns}
        rows={clubs.data}
        rowKey={(club) => club.id}
        loading={clubs.loading}
        error={clubs.error}
        emptyMessage="Nenhum clube cadastrado."
        onRetry={clubs.reload}
      />
      {creating && (
        <ClubForm
          pending={createClub.pending}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            if ((await createClub.run(payload)).ok) {
              setCreating(false);
              clubs.reload();
            }
          }}
        />
      )}
    </>
  );
}
