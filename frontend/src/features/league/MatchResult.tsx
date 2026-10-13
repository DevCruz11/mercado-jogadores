import { MatchDetail } from '../../api/types';
import { formatDateTime } from '../../utils/format';
import { DuelsTable } from './DuelsTable';

const RESULT_LABELS: Record<MatchDetail['result'], string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
};

export function MatchResult({ match }: { match: MatchDetail }) {
  return (
    <section className="card match-result" aria-label="Resultado da partida">
      <p className="muted">{formatDateTime(match.played_at)}</p>
      <div className="scoreboard">
        <span className="scoreboard__team">
          {match.home.club_name}
          <small>{match.home.formation}</small>
        </span>
        <strong className="scoreboard__score">
          {match.home.goals} × {match.away.goals}
        </strong>
        <span className="scoreboard__team">
          {match.away.club_name}
          <small>{match.away.formation}</small>
        </span>
      </div>
      <p className="scoreboard__result">{RESULT_LABELS[match.result]}</p>
      <DuelsTable match={match} />
    </section>
  );
}
