interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Login failed');
  }

  return res.json();
}
