import { refreshSession, logout } from '../components/auth/authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

let refreshPromise: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status !== 401 || !retry) {
    return response;
  }

  const refreshed = await refreshOnce();

  if (!refreshed) {
    await logout();
    return response;
  }

  return apiFetch(path, options, false);
}

export const httpClient = {
  get: (path: string, options: RequestInit = {}) =>
    apiFetch(path, { ...options, method: 'GET' }),

  post: (path: string, body?: unknown, options: RequestInit = {}) =>
    apiFetch(path, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  delete: (path: string, options: RequestInit = {}) =>
    apiFetch(path, { ...options, method: 'DELETE' }),
};
