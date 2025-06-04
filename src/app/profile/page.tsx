import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

export default async function MyProfile() {
  const session = await getServerSession(authOptions);
  if (!session) return <p className="p-8">Please login</p>;

  const user = session.user as {
    id: string;
    name?: string | null;
    image?: string | null;
    nickname?: string | null;
    bio?: string | null;
    twitter?: string | null;
    telegram?: string | null;
    website?: string | null;
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      {user.image && (
        <Image src={user.image} alt="avatar" width={80} height={80} className="rounded-full" />
      )}
      <h1 className="text-xl font-bold mt-4">{user.nickname || user.name || user.id}</h1>
      {user.bio && <p className="mt-2">{user.bio}</p>}
      {user.twitter && (
        <p className="mt-2">Twitter: <a href={`https://twitter.com/${user.twitter}`}>{user.twitter}</a></p>
      )}
      {user.website && (
        <p className="mt-2">Website: <a href={user.website}>{user.website}</a></p>
      )}
      <Link href="/profile/edit" className="inline-block mt-4 px-4 py-2 border rounded">
        Редактировать
      </Link>
    </div>
  );
}
