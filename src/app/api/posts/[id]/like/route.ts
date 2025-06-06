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
  const [user, post] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.post.findUnique({ where: { id }, select: { banned: true, banExpiresAt: true } }),
  ]);
  const now = new Date();
  if (user?.banned && (!user.banExpiresAt || user.banExpiresAt > now)) {
    return NextResponse.json({ error: 'Banned' }, { status: 403 });
  }
  if (post?.banned && (!post.banExpiresAt || post.banExpiresAt > now)) {
    return NextResponse.json({ error: 'Post banned' }, { status: 403 });
  }
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
