import { Duel, DuelParticipant, MatchDetail } from '../../api/types';
import { Column, DataTable } from '../../components/DataTable';

const ATTRIBUTE_LABELS: Record<string, string> = {
  shooting: 'finalização',
  passing: 'passe',
  dribbling: 'drible',
  defending: 'defesa',
};

function describe(participant: DuelParticipant): string {
  const condition = participant.condition === 'MAL_CONDICIONADO' ? ' · mal condicionado' : '';
  return `${participant.player_name} (${participant.position}${condition})`;
}

function attribute(participant: DuelParticipant): string {
  return `${ATTRIBUTE_LABELS[participant.attribute] ?? participant.attribute} ${participant.value}`;
}

export function DuelsTable({ match }: { match: MatchDetail }) {
  const clubName = (clubId: number) =>
    clubId === match.home.club_id ? match.home.club_name : match.away.club_name;

  const columns: Column<Duel>[] = [
    { header: 'Duelo', render: (duel) => duel.order, align: 'center' },
    { header: 'Ataca', render: (duel) => clubName(duel.attacking_club_id) },
    { header: 'Atacante', render: (duel) => describe(duel.attacker) },
    { header: 'Ataque', render: (duel) => attribute(duel.attacker), align: 'right' },
    { header: 'Defensor', render: (duel) => describe(duel.defender) },
    { header: 'Defesa', render: (duel) => attribute(duel.defender), align: 'right' },
    {
      header: 'Gol',
      render: (duel) => (duel.goal ? <strong className="positive">Gol</strong> : 'Não'),
      align: 'center',
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={match.duels}
      rowKey={(duel) => duel.order}
      loading={false}
      emptyMessage="Partida sem duelos."
    />
  );
}
