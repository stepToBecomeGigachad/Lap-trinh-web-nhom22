import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(_req, { params }) {
  const { id } = params;
  const u = await prisma.user.findUnique({ where: { id }, select: { id:true, email:true, name:true, role:true, createdAt:true } });
  if (!u) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  return NextResponse.json({ ok:true, user:u });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const data = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (body.role && (body.role === 'USER' || body.role === 'ADMIN')) data.role = body.role;
  if (Object.keys(data).length === 0) return NextResponse.json({ ok: false, error: 'No fields' }, { status: 400 });
  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
