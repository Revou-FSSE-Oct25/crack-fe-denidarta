import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/src/lib/mock-data';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { password: _pw, ...safeUser } = user;

  // Mock token — not real JWT, just a base64 placeholder
  const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString('base64');

  return NextResponse.json({ user: safeUser, token });
}
