import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <p className="p-8">Please login</p>;
  const userId = (session.user as { id: string }).id;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      post: {
        include: {
          photos: true,
          user: { select: { id: true, nickname: true, name: true, image: true } },
        },
      },
    },
  });
  if (notifications.length === 0) return <p className="p-8">Нет уведомлений</p>;
  return (
    <div className="p-8 space-y-4">
      {notifications.map((n) => (
        <div key={n.id} className="border p-4 rounded">
          Новый пост от{' '}
          <Link href={`/u/${n.post.user.id}`}>{n.post.user.nickname || n.post.user.name || n.post.user.id}</Link>
          :{' '}
          <Link href={`/posts/${n.post.id}`}>перейти к посту</Link>
        </div>
      ))}
    </div>
  );
}
