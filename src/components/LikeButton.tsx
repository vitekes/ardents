'use client';
import { useState } from 'react';

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked?: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
    }
  }

  return (
    <button onClick={toggle} className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}>
      ❤ {count}
    </button>
  );
}
