import Image from 'next/image';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Comments from './Comments';
import Link from 'next/link';
import ImageCarousel from '@/components/ImageCarousel';
import LikeButton from '@/components/LikeButton';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const post = await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
      likes: session?.user ? { where: { userId: (session.user as { id: string }).id } } : undefined,
      _count: { select: { likes: true } },
    },
  });
  if (!post) return <p className="p-8">Post not found</p>;

  return (
    <div className="p-8 space-y-4 max-w-xl mx-auto">
      <div className="border p-4 rounded">
        <div className="flex items-center gap-2 mb-2">
          {post.user.image && (
            <Image src={post.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
          )}
          <span>{post.user.nickname || post.user.name || post.user.id}</span>
          {((session?.user as { id?: string })?.id) === post.user.id && (
            <Link href={`/posts/${post.id}/edit`} className="ml-auto text-sm text-blue-500">Edit</Link>
          )}
        </div>
        {post.photos.length > 0 && (
          <ImageCarousel photos={post.photos} width={400} height={400} className="mb-2" />
        )}
        {post.description && <p className="mb-1">{post.description}</p>}
        {post.tags && <p className="text-sm text-gray-500">{post.tags}</p>}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span>Просмотры: {post.views}</span>
          <LikeButton postId={post.id} initialLiked={post.likes?.length > 0} initialCount={post._count.likes} />
        </div>
      </div>
      <Comments postId={post.id} currentUserId={(session?.user as { id?: string })?.id} />
    </div>
  );
}
