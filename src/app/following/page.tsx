import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import PostsFeed from '@/components/PostsFeed';
import type { Prisma } from '@prisma/client';

export default async function FollowingPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <p className="p-8">Please login</p>;

  const currentUserId = (session.user as { id: string }).id;
  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const ids = following.map(f => f.followingId);
  if (ids.length === 0) return <p className="p-8">Вы никого не отслеживаете</p>;

  const take = 10;
  const rawPosts = await prisma.post.findMany({
    take,
    where: { userId: { in: ids } },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
      likes: { where: { userId: currentUserId } },
      _count: { select: { likes: true } },
    },
  });

  type PostWithExtras = Prisma.PostGetPayload<{
    include: {
      photos: true;
      user: { select: { id: true; nickname: true; name: true; image: true } };
      likes: true;
      _count: { select: { likes: true } };
    };
  }>;
  const posts = rawPosts.map((p: PostWithExtras) => ({
    ...p,
    likeCount: p._count.likes,
    likedByMe: p.likes.length > 0,
  }));
  const nextCursor = posts.length === take ? posts[posts.length - 1].id : undefined;

  return (
    <section className="p-8">
      <PostsFeed initialPosts={posts} initialCursor={nextCursor} currentUserId={currentUserId} following />
    </section>
  );
}
