import { getAuthToken } from './auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  return res;
}

