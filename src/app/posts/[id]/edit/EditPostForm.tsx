'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [photos, setPhotos] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setPhotos(data.photos.map((p: { url: string }) => p.url).join('\n'));
        setDescription(data.description ?? '');
        setTags(data.tags ?? '');
      });
  }, [params.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const photoList = photos.split('\n').map((p) => p.trim()).filter(Boolean);
    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoList, description, tags }),
    });
    if (res.ok) {
      router.push('/');
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Редактировать пост</h1>
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
        <button type="submit" className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600">
          Сохранить
        </button>
      </form>
    </div>
  );
}
