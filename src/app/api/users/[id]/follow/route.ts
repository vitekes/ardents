import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ following: false });
  }
  const userId = (session.user as { id: string }).id;
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId, followingId: id } } });
  return NextResponse.json({ following: !!existing });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  if (userId === id) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId, followingId: id } } });
  if (existing) {
    await prisma.follow.delete({ where: { followerId_followingId: { followerId: userId, followingId: id } } });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({ data: { followerId: userId, followingId: id } });
    return NextResponse.json({ following: true });
  }
}
