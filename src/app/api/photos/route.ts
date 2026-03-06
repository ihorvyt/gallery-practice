import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedPhotoUrl } from '@/lib/storage';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const photos = await prisma.photo.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = await Promise.all(photos.map(async p => {
    let key = p.url;
    // If it's a full URL, extract the key
    if (p.url.startsWith('https://')) {
      try {
        const url = new URL(p.url);
        key = decodeURIComponent(url.pathname.substring(1));
      } catch (e) {
        console.error('Error parsing photo URL:', p.url, e);
      }
    }
    const signedUrl = await getSignedPhotoUrl(key);

    return {
      id: p.id,
      name: p.name,
      url: signedUrl,
      folder_id: p.folderId,
      owner_id: p.ownerId,
      size: p.size,
      created_at: p.createdAt,
    };
  }));

  return NextResponse.json(mapped, { status: 200 });
}

