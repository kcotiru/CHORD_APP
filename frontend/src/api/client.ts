// ── Thin fetch wrapper around the Express API ─────────────────────────────────
// Reads the JWT from the auth store on every call so it always uses the
// current token without needing to be passed manually.

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Imported lazily to avoid circular dependency with the store
let _getJwt: (() => string | null) | null = null;

export function registerJwtGetter(fn: () => string | null) {
  _getJwt = fn;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const jwt = _getJwt?.();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message ?? 'Unknown error',
      json.code,
      json.errors
    );
  }

  return json as T;
}

export const apiClient = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)     => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
