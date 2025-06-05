import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import PostsFeed from '@/components/PostsFeed';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const take = 10;
  const currentUserId = (session?.user as { id?: string })?.id;
  const rawPosts = await prisma.post.findMany({
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : undefined,
      _count: { select: { likes: true } },
    },
  });
  const posts = rawPosts.map((p) => ({
    ...p,
    likeCount: (p as any)._count.likes,
    likedByMe: (p as any).likes?.length > 0,
  }));
  const nextCursor = posts.length === take ? posts[posts.length - 1].id : undefined;

  return (
    <section className="p-8 space-y-4">
      {session && (
        <Link
          href="/posts/new"
          className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 inline-block"
        >
          Новый пост
        </Link>
      )}
      <PostsFeed initialPosts={posts} initialCursor={nextCursor} currentUserId={(session?.user as { id?: string })?.id} />
    </section>
  );
}
