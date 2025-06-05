import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string })?.id;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const userId = searchParams.get('userId');
  const take = 10;
  const postsRaw = await prisma.post.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    ...(userId ? { where: { userId } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : undefined,
      _count: { select: { likes: true } },
    },
  });
  const posts = postsRaw.map((p) => ({
    ...p,
    likeCount: (p as any)._count.likes,
    likedByMe: (p as any).likes?.length > 0,
  }));
  let nextCursor: string | undefined = undefined;
  if (posts.length > take) {
    const next = posts.pop();
    nextCursor = next?.id;
  }
  return NextResponse.json({ posts, nextCursor });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const userId = (session.user as { id: string }).id;
  try {
    const post = await prisma.post.create({
      data: {
        userId,
        description: data.description ?? null,
        tags: data.tags ?? null,
        photos: {
          create: (data.photos as string[]).map((url: string) => ({ url })),
        },
      },
      include: { photos: true, user: { select: { id: true, nickname: true, name: true, image: true } } },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
