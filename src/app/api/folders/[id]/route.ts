import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { id: string };
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const folderId = Number(params.id);
  if (!folderId) {
    return NextResponse.json({ error: 'Невірний ID' }, { status: 400 });
  }

  const deleted = await prisma.folder.deleteMany({
    where: { id: folderId, ownerId: user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: 'Не знайдено' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

