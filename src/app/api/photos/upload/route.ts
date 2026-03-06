import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImageToS3, getSignedPhotoUrl } from '@/lib/storage';

export async function POST(request: Request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const name = formData.get('name');
  const folderIdRaw = formData.get('folderId');

  if (!file || !(file instanceof File) || !name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Невірні дані' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = file.type || 'application/octet-stream';
  const key = `${user.id}/${Date.now()}-${file.name}`;

  const url = await uploadImageToS3(buffer, key, contentType);

  const folderId =
    typeof folderIdRaw === 'string' && folderIdRaw.length > 0 ? Number(folderIdRaw) || null : null;

  const photo = await prisma.photo.create({
    data: {
      name,
      url: key, // Store the key instead of public URL
      folderId,
      ownerId: user.id,
      size: file.size,
    },
  });

  const signedUrl = await getSignedPhotoUrl(key);

  return NextResponse.json(
    {
      id: photo.id,
      name: photo.name,
      url: signedUrl,
      folder_id: photo.folderId,
      owner_id: photo.ownerId,
      size: photo.size,
      created_at: photo.createdAt,
    },
    { status: 201 },
  );
}

