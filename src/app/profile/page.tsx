import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import PostsFeed from '@/components/PostsFeed';

import { prisma } from '@/lib/db';

export default async function MyProfile() {
  const session = await getServerSession(authOptions);
  if (!session) return <p className="p-8">Please login</p>;

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    select: {
      id: true,
      name: true,
      image: true,
      nickname: true,
      bio: true,
      twitter: true,
      telegram: true,
      website: true,
    },
  });
  if (!user) return <p className="p-8">Profile not found</p>;

  const take = 10;
  const posts = await prisma.post.findMany({
    take,
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
    },
  });
  const nextCursor = posts.length === take ? posts[posts.length - 1].id : undefined;

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div>
        {user.image && (
          <Image src={user.image} alt="avatar" width={80} height={80} className="rounded-full" />
        )}
        <h1 className="text-xl font-bold mt-4">{user.nickname || user.name || user.id}</h1>
        {user.bio && <p className="mt-2">{user.bio}</p>}
        {user.twitter && (
          <p className="mt-2">Twitter: <a href={`https://twitter.com/${user.twitter}`}>{user.twitter}</a></p>
        )}
        {user.website && (
          <p className="mt-2">Website: <a href={user.website}>{user.website}</a></p>
        )}
        <Link href="/profile/edit" className="inline-block mt-4 px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition">
          Редактировать
        </Link>
      </div>
      <PostsFeed initialPosts={posts} initialCursor={nextCursor} currentUserId={user.id} userId={user.id} />
    </div>
  );
}
