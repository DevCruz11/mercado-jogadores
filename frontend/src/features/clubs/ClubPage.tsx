import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clubsApi } from '../../api/clubs-api';
import { PageHeader } from '../../components/PageHeader';
import { useApiResource } from '../../hooks/useApiResource';
import { formatMoney } from '../../utils/format';
import { LineupTab } from './LineupTab';
import { SquadTab } from './SquadTab';
import { TransactionsTab } from './TransactionsTab';

const TABS = [
  { key: 'squad', label: 'Elenco' },
  { key: 'transactions', label: 'Histórico' },
  { key: 'lineup', label: 'Escalação' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function ClubPage() {
  const clubId = Number(useParams().clubId);
  const [tab, setTab] = useState<TabKey>('squad');
  const club = useApiResource(() => clubsApi.findById(clubId), String(clubId));

  if (club.error && !club.data) {
    return (
      <div className="empty-state">
        <p>{club.error}</p>
        <Link to="/clubs" className="button button--ghost">
          Voltar para clubes
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={club.data ? `${club.data.name} (${club.data.acronym})` : 'Carregando clube…'}
        actions={
          <Link to="/clubs" className="button button--ghost">
            ‹ Clubes
          </Link>
        }
      />
      {club.data && (
        <div className="stats">
          <Stat label="Caixa" value={formatMoney(club.data.cash)} />
          <Stat label="Valor do elenco" value={formatMoney(club.data.squad_value)} />
          <Stat label="Patrimônio" value={formatMoney(club.data.net_worth)} />
          <Stat label="Jogadores" value={`${club.data.players.length} / 12`} />
        </div>
      )}
      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`tabs__tab ${tab === item.key ? 'tabs__tab--active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'squad' && <SquadTab club={club} />}
      {tab === 'transactions' && <TransactionsTab clubId={clubId} />}
      {tab === 'lineup' && <LineupTab clubId={clubId} squad={club.data?.players ?? []} />}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
    </div>
  );
}
