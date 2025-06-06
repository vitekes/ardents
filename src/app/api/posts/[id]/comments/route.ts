import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, nickname: true, name: true, image: true } },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
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
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const now = new Date();
  if (user?.banned && (!user.banExpiresAt || user.banExpiresAt > now)) {
    return NextResponse.json({ error: 'Banned' }, { status: 403 });
  }
  if (post?.banned && (!post.banExpiresAt || post.banExpiresAt > now)) {
    return NextResponse.json({ error: 'Post banned' }, { status: 403 });
  }
  const data = await req.json();
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: id,
        userId,
        text: data.text,
        parentId: data.parentId ?? null,
      },
      include: {
        user: { select: { id: true, nickname: true, name: true, image: true } },
      },
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
