'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ImageCarousel from './ImageCarousel';
import Link from 'next/link';

interface Photo {
  id: string;
  url: string;
}

interface Post {
  id: string;
  description?: string | null;
  tags?: string | null;
  photos: Photo[];
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export default function PostsFeed({
  initialPosts,
  initialCursor,
  currentUserId,
  userId,
}: {
  initialPosts: Post[];
  initialCursor?: string | null;
  currentUserId?: string;
  userId?: string;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined | null>(initialCursor);
  const [uid] = useState<string | undefined>(userId);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!loaderRef.current) return;
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && cursor && !loadingRef.current) {
        loadingRef.current = true;
        const q = new URLSearchParams({ cursor });
        if (uid) q.append('userId', uid);
        fetch(`/api/posts?${q.toString()}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data) {
              setPosts((p) => [...p, ...data.posts]);
              setCursor(data.nextCursor);
            }
          })
          .finally(() => {
            loadingRef.current = false;
          });
      }
    });
    ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, [cursor, uid]);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            {post.user.image && (
              <Link href={`/u/${post.user.id}`}
                className="contents"
              >
                <Image
                  src={post.user.image}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </Link>
            )}
            <Link href={`/u/${post.user.id}`}>
              {post.user.nickname || post.user.name || post.user.id}
            </Link>
            {currentUserId === post.user.id && (
              <Link
                href={`/posts/${post.id}/edit`}
                className="ml-auto text-sm text-blue-500"
              >
                Edit
              </Link>
            )}
          </div>
          {post.photos.length > 0 && (
            <ImageCarousel
              photos={post.photos}
              width={480}
              height={640}
              className="mb-2"
            />
          )}
          {post.description && <p className="mb-1">{post.description}</p>}
          {post.tags && <p className="text-sm text-gray-500">{post.tags}</p>}
          <Link href={`/posts/${post.id}`} className="text-sm text-blue-500">Комментарии</Link>
        </div>
      ))}
      <div ref={loaderRef} />
    </div>
  );
}
