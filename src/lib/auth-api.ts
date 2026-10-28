import type { SessionRole, SessionProfile } from '@/components/app-state';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const demoAccounts: { profile: SessionProfile; role: SessionRole; password: string }[] = [
  {
    profile: {
      name: 'Paz Constanza Morales Saavedra',
      email: 'pc.morales@profesor.duoc.cl',
      run: '16.321.654-8',
      role: 'Administrador',
      school: 'Administración',
    },
    role: 'ADMIN',
    password: 'citt2026',
  },
  {
    profile: {
      name: 'Rocío Torres',
      email: 'rocio.torres@duocuc.cl',
      run: '19.882.112-k',
      role: 'Alumno Líder',
      school: 'Informática',
    },
    role: 'AYUDANTE',
    password: 'citt2026',
  },
  {
    profile: {
      name: 'Camila Soto',
      email: 'camila.soto@duocuc.cl',
      run: '18.765.432-1',
      role: 'Usuario Global',
      school: 'Administración',
    },
    role: 'GLOBAL',
    password: 'citt2026',
  },
];

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

const normalizeRun = (run: string) => run.replace(/[.\-\s]/g, '').toUpperCase();

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
  try {
    const response = await request<AuthResponse>('/auth/login', { run, password });
    return toSession(response);
  } catch (error) {
    // Si la API no está disponible o el usuario demo no está en la base de datos,
    // permitimos el acceso con las credenciales demo locales (citt2026):
    const cleanRun = normalizeRun(run);
    const demo = demoAccounts.find(
      (account) => normalizeRun(account.profile.run) === cleanRun && account.password === password
    );
    if (demo) {
      return {
        accessToken: `demo-token-${demo.role}`,
        role: demo.role,
        profile: demo.profile,
      } satisfies AuthenticatedSession;
    }
    throw error;
  }
}

export async function registerAccount(input: {
  name: string;
  email: string;
  run: string;
  school: string;
  password: string;
}) {
  try {
    const response = await request<AuthResponse>('/auth/register', input);
    return toSession(response);
  } catch (error) {
    // Si el backend no está disponible, permite crear una cuenta local para pruebas:
    if (error instanceof Error && error.message.includes('No se pudo conectar')) {
      return {
        accessToken: `demo-token-GLOBAL-${Date.now()}`,
        role: 'GLOBAL' as SessionRole,
        profile: {
          id: `M-REG-${Date.now()}`,
          name: input.name.trim(),
          email: input.email.trim(),
          run: input.run.trim(),
          role: 'Usuario Global',
          school: input.school,
        },
      } satisfies AuthenticatedSession;
    }
    throw error;
  }
}

export async function restoreSession(accessToken: string) {
  if (accessToken.startsWith('demo-token-')) {
    const rolePart = accessToken.split('-')[2] as SessionRole | undefined;
    const role: SessionRole = rolePart && ['ADMIN', 'AYUDANTE', 'GLOBAL'].includes(rolePart)
      ? rolePart
      : 'GLOBAL';
    const demo = demoAccounts.find((account) => account.role === role);
    return {
      accessToken,
      role,
      profile: demo?.profile ?? {
        name: 'Usuario Demo',
        email: 'demo@duocuc.cl',
        run: '18.765.432-1',
        role: 'Usuario Global',
        school: 'Informática',
      },
    } satisfies AuthenticatedSession;
  }
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
