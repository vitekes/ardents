'use client';
import { useState } from 'react';
import Image from 'next/image';

export interface Photo {
  id?: string;
  url: string;
}

export default function ImageCarousel({
  photos,
  width = 200,
  height = 200,
  className = '',
}: {
  photos: Photo[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;

  const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  const photo = photos[index];

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={photo.url}
        alt="photo"
        width={width}
        height={height}
        className="object-cover w-full h-full"
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
