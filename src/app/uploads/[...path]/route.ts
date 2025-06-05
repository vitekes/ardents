import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  const filePath = path.join(process.cwd(), 'uploads', ...pathParts);
  try {
    const data = await fs.readFile(filePath);
    const type = mime.getType(filePath) || 'application/octet-stream';
    return new NextResponse(data, {
      headers: { 'Content-Type': type },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
