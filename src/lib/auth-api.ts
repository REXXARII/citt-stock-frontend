import type { SessionRole, SessionProfile } from '@/components/app-state';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    run: string;
    role: SessionRole;
    role_name: string;
    school: string;
    is_blocked: boolean;
  };
}

export interface AuthenticatedSession {
  profile: SessionProfile;
  role: SessionRole;
  accessToken: string;
}

async function request<T>(path: string, body?: Record<string, string>, accessToken?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
  } catch {
    throw new Error(`No se pudo conectar con el servidor de autenticación (${API_URL}).`);
  }

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const message = typeof result === 'object' && result !== null && 'message' in result
      ? result.message
      : 'Ocurrió un error al autenticar.';
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }
  return response.json() as Promise<T>;
}

function toSession(response: AuthResponse): AuthenticatedSession {
  return {
    accessToken: response.access_token,
    role: response.user.role,
    profile: {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      run: response.user.run,
      role: response.user.role_name,
      school: response.user.school,
      is_blocked: response.user.is_blocked,
    },
  };
}

export async function login(run: string, password: string) {
  const response = await request<AuthResponse>('/auth/login', { run, password });
  return toSession(response);
}

export async function registerAccount(input: {
  name: string;
  email: string;
  run: string;
  school: string;
  password: string;
}) {
  const response = await request<AuthResponse>('/auth/register', input);
  return toSession(response);
}

export async function restoreSession(accessToken: string) {
  const user = await request<AuthResponse['user']>('/auth/me', undefined, accessToken);
  return {
    accessToken,
    role: user.role,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      run: user.run,
      role: user.role_name,
      school: user.school,
      is_blocked: user.is_blocked,
    },
  } satisfies AuthenticatedSession;
}
