'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const [photos, setPhotos] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const photoList = photos.split('\n').map((p) => p.trim()).filter(Boolean);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoList, description, tags }),
    });
    if (res.ok) {
      router.push('/');
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Новый пост</h1>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <textarea
          placeholder="Image URLs, one per line"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          className="border p-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600">Создать</button>
      </form>
    </div>
  );
}
