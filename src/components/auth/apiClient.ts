import { refreshSession } from './authService';

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const options: RequestInit = {
    ...init,
    credentials: 'include', // Envía cookies HttpOnly automáticamente
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  };

  let response = await fetch(input, options);

  // Si el access token expiró (401), intentamos renovar con el refresh token en cookie
  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await fetch(input, options);
    }
  }

  return response;
}