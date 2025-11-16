import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../../lib/auth';

export async function GET(_req, { params }) {
  const { slug } = params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({ where: { productId: product.id }, orderBy: { createdAt: 'desc' }, take: 100, include: { user: { select: { name:true, email:true } } } }),
    prisma.review.groupBy({ by: ['rating'], where: { productId: product.id }, _count: { rating: true } })
  ]);
  const total = reviews.length;
  const distr = {1:0,2:0,3:0,4:0,5:0};
  counts.forEach(c => { distr[c.rating] = c._count.rating; });
  const avg = total ? (reviews.reduce((t,r)=>t+r.rating,0) / total) : 0;
  return NextResponse.json({ ok:true, total, avg, distr, reviews: reviews.map(r => ({ id:r.id, rating:r.rating, comment:r.comment||'', createdAt:r.createdAt, user:{ name:r.user?.name||'', email:r.user?.email||'' } })) });
}

export async function POST(request, { params }) {
  const { slug } = params;
  const token = request.cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });

  const body = await request.json().catch(()=>({}));
  const rating = Number(body.rating||0);
  const comment = (body.comment||'').slice(0, 2000);
  if (!(rating>=1 && rating<=5)) return NextResponse.json({ ok:false, error:'Invalid rating' }, { status:400 });

  const [product, user] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, select: { id:true } }),
    prisma.user.upsert({ where: { email: sess.email }, update: { name: sess.name||'' }, create: { email: sess.email, name: sess.name||'', passwordHash: '' } })
  ]);
  if (!product) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });

  await prisma.review.upsert({
    where: { productId_userId: { productId: product.id, userId: user.id } },
    update: { rating, comment },
    create: { productId: product.id, userId: user.id, rating, comment },
  });
  return NextResponse.json({ ok:true });
}

