import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ClubPage } from './features/clubs/ClubPage';
import { ClubsPage } from './features/clubs/ClubsPage';
import { MatchesPage } from './features/league/MatchesPage';
import { StandingsPage } from './features/league/StandingsPage';
import { PlayersPage } from './features/players/PlayersPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/players" replace />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="clubs" element={<ClubsPage />} />
        <Route path="clubs/:clubId" element={<ClubPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="*" element={<Navigate to="/players" replace />} />
      </Route>
    </Routes>
  );
}
