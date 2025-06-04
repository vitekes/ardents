import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json(user);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const userId = (session.user as { id?: string }).id as string;
  await prisma.user.update({
    where: { id: userId },
    data,
  });
  return NextResponse.json({ success: true });
}
