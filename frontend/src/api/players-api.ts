import { request } from './http-client';
import {
  BuyPayload,
  Condition,
  CreatePlayerPayload,
  Player,
  PlayerFilters,
  PlayerPage,
  PurchaseResult,
  SaleResult,
  UpdatePlayerPayload,
} from './types';

export const playersApi = {
  list: (filters: PlayerFilters) =>
    request<PlayerPage>('GET', '/players', { params: { ...filters } }),
  create: (payload: CreatePlayerPayload) => request<Player>('POST', '/players', { body: payload }),
  update: (id: number, payload: UpdatePlayerPayload) =>
    request<Player>('PUT', `/players/${id}`, { body: payload }),
  changeCondition: (id: number, condition: Condition) =>
    request<Player>('PATCH', `/players/${id}/condition`, { body: { condition } }),
  remove: (id: number) => request<void>('DELETE', `/players/${id}`),
  buy: (id: number, payload: BuyPayload) =>
    request<PurchaseResult>('POST', `/players/${id}/buy`, { body: payload }),
  sell: (id: number) => request<SaleResult>('POST', `/players/${id}/sell`),
};
