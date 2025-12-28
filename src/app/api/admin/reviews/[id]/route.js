import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../../lib/auth';

export async function DELETE(request, { params }) {
  try {
    const token = cookies().get(sessionCookieName())?.value;
    const sess = await parseSession(token);
    
    if (!sess || sess.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.review.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
