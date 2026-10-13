import { leagueApi } from '../../api/league-api';
import { Standing } from '../../api/types';
import { Column, DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { useApiResource } from '../../hooks/useApiResource';

const columns: Column<Standing>[] = [
  { header: '#', render: (row) => row.position, align: 'center' },
  { header: 'Clube', render: (row) => row.club_name },
  { header: 'Jogos', render: (row) => row.played, align: 'right' },
  { header: 'Vitórias', render: (row) => row.wins, align: 'right' },
  { header: 'Empates', render: (row) => row.draws, align: 'right' },
  { header: 'Derrotas', render: (row) => row.losses, align: 'right' },
  { header: 'Gols marcados', render: (row) => row.goals_for, align: 'right' },
  { header: 'Gols sofridos', render: (row) => row.goals_against, align: 'right' },
  {
    header: 'Saldo',
    render: (row) => (row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference),
    align: 'right',
  },
  { header: 'Pontos', render: (row) => <strong>{row.points}</strong>, align: 'right' },
];

export function StandingsPage() {
  const standings = useApiResource(() => leagueApi.standings(), 'standings');
  return (
    <>
      <PageHeader
        title="Classificação"
        description="Vitória 3 pontos, empate 1. Desempate por saldo, gols marcados e nome."
      />
      <DataTable
        columns={columns}
        rows={standings.data}
        rowKey={(row) => row.club_id}
        loading={standings.loading}
        error={standings.error}
        emptyMessage="Nenhum clube cadastrado."
        onRetry={standings.reload}
      />
    </>
  );
}
