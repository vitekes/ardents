import { prisma } from '@/lib/db'
import Image from 'next/image'

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return <p className="p-8">User not found</p>;
  return (
    <div className="p-8 max-w-xl mx-auto">
      {user.image && <Image src={user.image} alt="avatar" width={80} height={80} className="rounded-full" />}
      <h1 className="text-xl font-bold mt-4">{user.nickname || user.name || user.id}</h1>
      {user.bio && <p className="mt-2">{user.bio}</p>}
      {user.twitter && (
        <p className="mt-2">
          Twitter: <a href={`https://twitter.com/${user.twitter}`}>{user.twitter}</a>
        </p>
      )}
      {user.website && (
        <p className="mt-2">
          Website: <a href={user.website}>{user.website}</a>
        </p>
      )}
    </div>
  );
}
