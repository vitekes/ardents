import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string })?.id;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const userId = searchParams.get('userId');
  const take = 10;
  const postsRaw = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    ...(userId ? { where: { userId } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true, banned: true, banExpiresAt: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : undefined,
      _count: { select: { likes: true } },
    },
  });

  type PostWithExtras = Prisma.PostGetPayload<{
    include: {
      photos: true;
      user: { select: { id: true, nickname: true, name: true, image: true, banned: true, banExpiresAt: true } };
      likes: true;
      _count: { select: { likes: true } };
    };
  }>;

  const now = new Date();
  const posts = postsRaw
    .filter((p: PostWithExtras) => {
      const userBanned = p.user.banned && (!p.user.banExpiresAt || new Date(p.user.banExpiresAt) > now);
      const postBanned = p.banned && (!p.banExpiresAt || new Date(p.banExpiresAt) > now);
      return !userBanned && !postBanned;
    })
    .map((p: PostWithExtras) => ({
      ...p,
      likeCount: p._count.likes,
      likedByMe: p.likes.length > 0,
    }));
  let nextCursor: string | undefined = undefined;
  if (posts.length > take) {
    const next = posts.pop();
    nextCursor = next?.id;
  }
  return NextResponse.json({ posts, nextCursor });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const now = new Date();
  if (user?.banned && (!user.banExpiresAt || user.banExpiresAt > now)) {
    return NextResponse.json({ error: 'Banned' }, { status: 403 });
  }
  try {
    const post = await prisma.post.create({
      data: {
        userId,
        description: data.description ?? null,
        tags: data.tags ?? null,
        photos: {
          create: (data.photos as string[]).map((url: string) => ({ url })),
        },
      },
      include: { photos: true, user: { select: { id: true, nickname: true, name: true, image: true } } },
    });

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });
    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map(f => ({ userId: f.followerId, postId: post.id })),
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}