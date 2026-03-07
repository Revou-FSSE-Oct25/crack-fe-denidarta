import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/src/lib/mock-data';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = users.find(u => u.id === Number(id));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { password: _pw, ...safe } = user;
  return NextResponse.json(safe);
}