import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET /api/admin/users?search=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('search') || '').trim();
  const where = q
    ? { OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { name:  { contains: q, mode: 'insensitive' } },
      ] }
    : {};
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, items: users });
}
