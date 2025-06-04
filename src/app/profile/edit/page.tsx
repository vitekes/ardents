import { prisma } from '@/lib/db';
import Image from 'next/image';
import { notFound } from 'next/navigation';

type PageProps = {
  params: { id: string };
};

export default async function PublicProfile({ params }: PageProps) {
  const { id } = params;                       // ✨ без await
  const user = await prisma.user.findUnique({
    where: { id: id.toLowerCase() },           // адреса храним в lower-case
  });

  if (!user) notFound();                       // корректный 404

  return (
    <div className="p-8 max-w-xl mx-auto">
      {user.image && (
        <Image
          src={user.image}
          alt="avatar"
          width={80}
          height={80}
          className="rounded-full"
        />
      )}

      <h1 className="text-xl font-bold mt-4">
        {user.nickname || user.name || user.id}
      </h1>

      {user.bio && <p className="mt-2">{user.bio}</p>}

      {user.twitter && (
        <p className="mt-2">
          Twitter:{' '}
          <a
            href={`https://twitter.com/${user.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {user.twitter}
          </a>
        </p>
      )}

      {user.website && (
        <p className="mt-2">
          Website:{' '}
          <a
            href={user.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {user.website}
          </a>
        </p>
      )}
    </div>
  );
}