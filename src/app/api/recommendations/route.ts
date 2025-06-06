import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'

/**
 * Simple recommendation algorithm:
 *  - Select posts with the highest number of likes.
 *  - Exclude posts authored by the current user if logged in.
 *  - Limit to five items sorted by like count and creation date.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  const currentUserId = (session?.user as { id?: string })?.id

  const rawPosts = await prisma.post.findMany({
    take: 5,
    where: currentUserId ? { userId: { not: currentUserId } } : {},
    orderBy: [
      { likes: { _count: 'desc' } },
      { createdAt: 'desc' },
    ],
    include: {
      photos: true,
      user: { select: { id: true, nickname: true, name: true, image: true } },
    },
  })

  type PostWithExtras = Prisma.PostGetPayload<{
    include: {
      photos: true
      user: { select: { id: true; nickname: true; name: true; image: true } }
    }
  }>

  return NextResponse.json(rawPosts as PostWithExtras[])
}
