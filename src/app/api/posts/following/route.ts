import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const take = 10;
  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const ids = following.map(f => f.followingId);
  if (ids.length === 0) return NextResponse.json({ posts: [], nextCursor: null });
  const postsRaw = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: { userId: { in: ids } },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true, banned: true, banExpiresAt: true } },
      likes: { where: { userId: currentUserId } },
      _count: { select: { likes: true } },
    },
  });

  type PostWithExtras = Prisma.PostGetPayload<{
    include: {
      photos: true;
      user: { select: { id: true; nickname: true; name: true; image: true; banned: true; banExpiresAt: true } };
      likes: true;
      _count: { select: { likes: true } };
    };
  }>;

  const now = new Date();
  const posts = postsRaw
    .filter((p: any) => {
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
