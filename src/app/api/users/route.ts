import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/src/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  const filtered = role ? users.filter(u => u.role === role) : users;
  const safe = filtered.map(({ password: _pw, ...u }) => u);

  return NextResponse.json(safe);
}
