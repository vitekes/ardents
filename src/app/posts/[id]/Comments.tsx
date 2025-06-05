'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  nickname?: string | null;
  name?: string | null;
  image?: string | null;
}

interface Comment {
  id: string;
  parentId?: string | null;
  text: string;
  user: User;
}

export default function Comments({ postId, currentUserId }:{ postId: string; currentUserId?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(setComments);
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, parentId: replyTo }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments(c => [...c, comment]);
      setText('');
      setReplyTo(null);
    }
  }

  function renderComments(parent: string | null = null, level = 0) {
    return comments
      .filter(c => (c.parentId ?? null) === parent)
      .map(c => (
        <div key={c.id} style={{ marginLeft: level * 16 }} className="border-l pl-4 my-2">
          <div className="flex items-center gap-2 mb-1">
            {c.user.image && (
              <Image src={c.user.image} alt="avatar" width={20} height={20} className="rounded-full" />
            )}
            <span className="text-sm">{c.user.nickname || c.user.name || c.user.id}</span>
          </div>
          <p className="mb-1 text-sm">{c.text}</p>
          {currentUserId && (
            <button onClick={() => setReplyTo(c.id)} className="text-xs text-blue-500">Ответить</button>
          )}
          {renderComments(c.id, level + 1)}
        </div>
      ));
  }

  return (
    <div className="mt-4">
      {renderComments()}
      {currentUserId && (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
          {replyTo && (
            <div className="text-sm">
              Ответ на комментарий
              <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-gray-500">Отмена</button>
            </div>
          )}
          <textarea value={text} onChange={e => setText(e.target.value)} className="border p-2" />
          <button type="submit" className="self-start px-2 py-1 border rounded bg-blue-500 text-white">Отправить</button>
        </form>
      )}
    </div>
  );
}
