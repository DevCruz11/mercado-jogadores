const DEFAULT_API_URL = 'http://localhost:3000/api/v1';
const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar à API. Verifique se o backend está no ar.';

export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export type QueryParams = Record<string, string | number | boolean | undefined>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function buildUrl(path: string, params: QueryParams = {}): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return `${API_URL}${path}${queryString ? `?${queryString}` : ''}`;
}

export async function request<T>(
  method: string,
  path: string,
  options: { params?: QueryParams; body?: unknown } = {},
): Promise<T> {
  const response = await send(buildUrl(path, options.params), {
    method,
    headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function download(path: string, params: QueryParams): Promise<Blob> {
  const response = await send(buildUrl(path, params), { method: 'GET' });
  return response.blob();
}

async function send(url: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }
  return response;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message || `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}
