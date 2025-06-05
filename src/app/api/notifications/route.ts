import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const notificationsRaw = await prisma.notification.findMany({
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

  type NotificationWithPost = Prisma.NotificationGetPayload<{
    include: {
      post: {
        include: {
          photos: true;
          user: { select: { id: true; nickname: true; name: true; image: true } };
        };
      };
    };
  }>;

  const notifications = notificationsRaw as NotificationWithPost[];
  return NextResponse.json(notifications);
}
