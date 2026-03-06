import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const { id } = await params;
  const photoId = Number(id);
  if (!photoId) {
    return NextResponse.json({ error: 'Невірний ID' }, { status: 400 });
  }

  const body = await request.json();
  const { folderId } = body;

  const updated = await prisma.photo.updateMany({
    where: { id: photoId, ownerId: user.id },
    data: { folderId: folderId || null },
  });

  if (!updated.count) {
    return NextResponse.json({ error: 'Не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const { id } = await params;
  const photoId = Number(id);
  if (!photoId) {
    return NextResponse.json({ error: 'Невірний ID' }, { status: 400 });
  }

  const deleted = await prisma.photo.deleteMany({
    where: { id: photoId, ownerId: user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: 'Не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

