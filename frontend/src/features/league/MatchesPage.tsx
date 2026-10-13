import { useState } from 'react';
import { clubsApi } from '../../api/clubs-api';
import { leagueApi } from '../../api/league-api';
import { Match, MatchDetail, MatchPayload } from '../../api/types';
import { Column, DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { useAction } from '../../hooks/useAction';
import { useApiResource } from '../../hooks/useApiResource';
import { formatDateTime } from '../../utils/format';
import { MatchForm } from './MatchForm';
import { MatchResult } from './MatchResult';

export function MatchesPage() {
  const [clubFilter, setClubFilter] = useState('');
  const [lastMatch, setLastMatch] = useState<MatchDetail>();
  const [openedMatch, setOpenedMatch] = useState<MatchDetail>();
  const clubs = useApiResource(() => clubsApi.list('name'), 'clubs');
  const matches = useApiResource(
    () => leagueApi.matches(clubFilter ? Number(clubFilter) : undefined),
    clubFilter,
  );
  const playMatch = useAction(
    (payload: MatchPayload) => leagueApi.play(payload),
    'Partida jogada.',
  );
  const openMatch = useAction((id: number) => leagueApi.match(id));

  const columns: Column<Match>[] = [
    { header: 'Data e hora', render: (match) => formatDateTime(match.played_at) },
    { header: 'Mandante', render: (match) => match.home.club_name, align: 'right' },
    {
      header: 'Placar',
      render: (match) => (
        <strong>
          {match.home.goals} × {match.away.goals}
        </strong>
      ),
      align: 'center',
    },
    { header: 'Visitante', render: (match) => match.away.club_name },
    {
      header: 'Ações',
      render: (match) => (
        <button
          type="button"
          className="button button--small"
          disabled={openMatch.pending}
          onClick={async () => {
            const outcome = await openMatch.run(match.id);
            if (outcome.ok) {
              setOpenedMatch(outcome.result);
            }
          }}
        >
          Ver duelos
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Partidas"
        description="Escolha mandante e visitante. O placar sai dos 6 duelos calculados pela API."
      />
      <MatchForm
        clubs={clubs.data ?? []}
        pending={playMatch.pending}
        onSubmit={async (payload) => {
          const outcome = await playMatch.run(payload);
          if (outcome.ok) {
            setLastMatch(outcome.result);
            matches.reload();
          }
        }}
      />
      {lastMatch && <MatchResult match={lastMatch} />}

      <h2 className="section-title">Histórico de partidas</h2>
      <section className="filters">
        <label className="filters__item">
          <span>Clube</span>
          <select
            className="input"
            value={clubFilter}
            onChange={(event) => setClubFilter(event.target.value)}
          >
            <option value="">Todos</option>
            {(clubs.data ?? []).map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
      </section>
      <DataTable
        columns={columns}
        rows={matches.data}
        rowKey={(match) => match.id}
        loading={matches.loading}
        error={matches.error}
        emptyMessage="Nenhuma partida jogada."
        onRetry={matches.reload}
      />
      {openedMatch && (
        <Modal title={`Partida #${openedMatch.id}`} onClose={() => setOpenedMatch(undefined)}>
          <MatchResult match={openedMatch} />
        </Modal>
      )}
    </>
  );
}
