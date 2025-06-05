'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const router = useRouter();

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
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoUrls, description, tags }),
    });
    if (res.ok) {
      router.push('/');
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Новый пост</h1>
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
            <div className="flex gap-2 overflow-x-auto">
              {photoUrls.map((url) => (
                <img key={url} src={url} alt="preview" className="w-20 h-20 object-cover" />
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
        <button type="submit" className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600">Создать</button>
      </form>
    </div>
  );
}
