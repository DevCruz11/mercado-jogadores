import { download, request } from './http-client';
import {
  Club,
  ClubDetail,
  ClubSort,
  CreateClubPayload,
  Lineup,
  LineupPayload,
  TransactionFilters,
  TransactionHistory,
} from './types';

function transactionParams(filters: TransactionFilters) {
  return {
    type: filters.types.length > 0 ? filters.types.join(',') : undefined,
    player_id: filters.player_id,
  };
}

export const clubsApi = {
  list: (sort: ClubSort) => request<Club[]>('GET', '/clubs', { params: { sort } }),
  findById: (id: number) => request<ClubDetail>('GET', `/clubs/${id}`),
  create: (payload: CreateClubPayload) => request<Club>('POST', '/clubs', { body: payload }),
  transactions: (id: number, filters: TransactionFilters) =>
    request<TransactionHistory>('GET', `/clubs/${id}/transactions`, {
      params: transactionParams(filters),
    }),
  exportTransactions: (id: number, filters: TransactionFilters) =>
    download(`/clubs/${id}/transactions/export`, transactionParams(filters)),
  lineup: (id: number) => request<Lineup>('GET', `/clubs/${id}/lineup`),
  saveLineup: (id: number, payload: LineupPayload) =>
    request<Lineup>('PUT', `/clubs/${id}/lineup`, { body: payload }),
};
