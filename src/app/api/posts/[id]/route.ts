import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string })?.id;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true, banned: true, banExpiresAt: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : undefined,
      _count: { select: { likes: true } },
    },
  });
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  type PostWithExtras = Prisma.PostGetPayload<{
    include: {
      photos: true;
      user: { select: { id: true; nickname: true; name: true; image: true; banned: true; banExpiresAt: true } };
      likes: true;
      _count: { select: { likes: true } };
    };
  }>;
  const p = post as PostWithExtras;
  const now = new Date();
  const userBanned = p.user.banned && (!p.user.banExpiresAt || new Date(p.user.banExpiresAt) > now);
  const postBanned = p.banned && (!p.banExpiresAt || new Date(p.banExpiresAt) > now);
  if (userBanned || postBanned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    ...p,
    likeCount: p._count.likes,
    likedByMe: p.likes.length > 0,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const data = await req.json();
  try {
    const post = await prisma.post.update({
      where: { id, userId },
      data: {
        description: data.description ?? null,
        tags: data.tags ?? null,
        photos: {
          deleteMany: {},
          create: (data.photos as string[]).map((url: string) => ({ url })),
        },
      },
      include: {
        photos: true,
        user: { select: { id: true, nickname: true, name: true, image: true } },
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
