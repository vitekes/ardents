'use client';
import { useState } from 'react';

export default function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);

  async function toggle() {
    const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
    }
  }

  return (
    <button onClick={toggle} className="mt-2 px-4 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600">
      {following ? 'Отписаться' : 'Подписаться'}
    </button>
  );
}
