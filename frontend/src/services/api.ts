const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  json?: unknown;
}

async function request(path: string, options: RequestOptions = {}) {
  const { json, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...rest,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }

  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, json: unknown) => request(path, { method: 'POST', json }),
  put: (path: string, json: unknown) => request(path, { method: 'PUT', json }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};
