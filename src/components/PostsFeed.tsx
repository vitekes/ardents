'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
}: {
  initialPosts: Post[];
  initialCursor?: string | null;
  currentUserId?: string;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined | null>(initialCursor);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!loaderRef.current) return;
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && cursor && !loadingRef.current) {
        loadingRef.current = true;
        fetch(`/api/posts?cursor=${cursor}`)
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
  }, [cursor]);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            {post.user.image && (
              <Image
                src={post.user.image}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span>{post.user.nickname || post.user.name || post.user.id}</span>
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
            <div className="flex gap-2 overflow-x-auto mb-2">
              {post.photos.map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.url}
                  alt="photo"
                  width={200}
                  height={200}
                  className="object-cover"
                />
              ))}
            </div>
          )}
          {post.description && <p className="mb-1">{post.description}</p>}
          {post.tags && <p className="text-sm text-gray-500">{post.tags}</p>}
        </div>
      ))}
      <div ref={loaderRef} />
    </div>
  );
}
