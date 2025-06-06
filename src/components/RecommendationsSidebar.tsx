'use client'
import useSWR from 'swr'
import Image from 'next/image'
import Link from 'next/link'

interface Recommendation {
  id: string
  description?: string | null
  photos: { id: string; url: string }[]
  user: { id: string; nickname?: string | null; name?: string | null; image?: string | null }
}

const fetcher = (url: string) => fetch(url).then(res => res.ok ? res.json() : [])

export default function RecommendationsSidebar() {
  const { data } = useSWR<Recommendation[]>(
    '/api/recommendations',
    fetcher,
  )

  if (!data) return null

  return (
    <aside className="w-72 space-y-4">
      <h2 className="text-lg font-bold">Рекомендуемое</h2>
      {data.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`} className="block border rounded p-2 hover:bg-gray-50">
          {post.photos[0] && (
            <Image src={post.photos[0].url} alt="preview" width={240} height={160} className="mb-2 rounded" />
          )}
          <p className="font-medium">{post.description ?? 'Без описания'}</p>
          <p className="text-sm text-gray-500">{post.user.nickname || post.user.name || post.user.id}</p>
        </Link>
      ))}
    </aside>
  )
}
