import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/isAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!session || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  await prisma.user.update({
    where: { id },
    data: {
      banned: data.banned ?? true,
      banExpiresAt: data.banned ? (data.banExpiresAt ? new Date(data.banExpiresAt) : null) : null,
    },
  });
  return NextResponse.json({ success: true });
}
