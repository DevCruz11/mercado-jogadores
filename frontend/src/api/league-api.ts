import { request } from './http-client';
import { Match, MatchDetail, MatchPayload, Standing } from './types';

export const leagueApi = {
  play: (payload: MatchPayload) => request<MatchDetail>('POST', '/matches', { body: payload }),
  matches: (clubId?: number) =>
    request<Match[]>('GET', '/matches', { params: { club_id: clubId } }),
  match: (id: number) => request<MatchDetail>('GET', `/matches/${id}`),
  standings: () => request<Standing[]>('GET', '/standings'),
};
