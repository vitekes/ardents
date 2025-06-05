import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Save uploaded images under the `uploads` directory at the project root.

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const safeName = path.basename(file.name);
  const filename = `${Date.now()}-${safeName}`;
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
