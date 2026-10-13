import { NavLink, Outlet } from 'react-router-dom';

const NAVIGATION = [
  { to: '/players', label: 'Jogadores' },
  { to: '/clubs', label: 'Clubes' },
  { to: '/matches', label: 'Partidas' },
  { to: '/standings', label: 'Classificação' },
];

export function Layout() {
  return (
    <div className="layout">
      <header className="topbar">
        <NavLink to="/players" className="brand">
          <span className="brand__logo" aria-hidden="true">
            P
          </span>
          Passe
        </NavLink>
        <nav className="topbar__nav" aria-label="Navegação principal">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `topbar__link ${isActive ? 'topbar__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="topbar__note">Horário de Brasília (UTC−3)</span>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
