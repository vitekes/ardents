'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setPhotoUrls(data.photos.map((p: { url: string }) => p.url));
        setDescription(data.description ?? '');
        setTags(data.tags ?? '');
      });
  }, [params.id]);

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setPhotoUrls((u) => [...u, data.url]);
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoUrls, description, tags }),
    });
    if (res.ok) {
      router.push('/');
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Редактировать пост</h1>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div
          className="border border-dashed p-4 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {photoUrls.length === 0 ? (
            <p>Перетащите изображения сюда или нажмите для выбора</p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {photoUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20">
                  <img src={url} alt="preview" className="object-cover w-20 h-20" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoUrls((u) => u.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-0 right-0 bg-white/80 rounded-full px-1"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
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
