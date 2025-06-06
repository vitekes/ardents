import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const userId = (session.user as { id?: string }).id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const userId = (session.user as { id?: string }).id as string;
  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: data,
      create: { id: userId, ...data },
    });
    try {
      const { updateDirectusUser } = await import('@/lib/directus');
      await updateDirectusUser(userId, data);
    } catch (err) {
      console.error('Directus profile sync failed', err);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
