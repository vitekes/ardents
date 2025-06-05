import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId: id, userId } },
  });
  let liked: boolean;
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.like.create({ data: { postId: id, userId } });
    liked = true;
  }
  const count = await prisma.like.count({ where: { postId: id } });
  return NextResponse.json({ liked, count });
}
