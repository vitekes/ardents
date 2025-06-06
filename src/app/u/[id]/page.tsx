import { prisma } from '@/lib/db'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PostsFeed from '@/components/PostsFeed'
import FollowButton from '@/components/FollowButton'
import type { Prisma } from '@prisma/client'

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const [session, user] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.findUnique({ where: { id } }),
  ]);

  const isFollowing = session
    ? (await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: (session.user as { id: string }).id, followingId: id } },
      })) != null
    : false;

  const take = 10;
  const currentUserId = (session?.user as { id?: string })?.id;
  const rawPosts = await prisma.post.findMany({
    take,
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : undefined,
      _count: { select: { likes: true } },
    },
  });
  type PostWithExtras = Prisma.PostGetPayload<{
    include: {
      photos: true
      user: { select: { id: true; nickname: true; name: true; image: true } }
      likes: true
      _count: { select: { likes: true } }
    }
  }>;
  const posts = rawPosts.map((p: PostWithExtras) => ({
    ...p,
    likeCount: p._count.likes,
    likedByMe: p.likes.length > 0,
  }));
  const nextCursor = posts.length === take ? posts[posts.length - 1].id : undefined;

  if (!user) return <p className="p-8">User not found</p>;
  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div>
        {user.image && (
          <Image src={user.image} alt="avatar" width={80} height={80} className="rounded-full" />
        )}
        <h1 className="text-xl font-bold mt-4">{user.nickname || user.name || user.id}</h1>
        {user.bio && <p className="mt-2">{user.bio}</p>}
        {user.twitter && (
          <p className="mt-2">
            Twitter: <a href={`https://twitter.com/${user.twitter}`}>{user.twitter}</a>
          </p>
        )}
        {user.website && (
          <p className="mt-2">
            Website: <a href={user.website}>{user.website}</a>
          </p>
        )}
        {session && session.user?.id !== id && (
          <FollowButton userId={id} initialFollowing={isFollowing} />
        )}
      </div>
      <PostsFeed
        initialPosts={posts}
        initialCursor={nextCursor}
        currentUserId={(session?.user as { id?: string })?.id}
        userId={id}
      />
    </div>
  );
}
