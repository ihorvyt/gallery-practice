import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const folders = await prisma.folder.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = folders.map(f => ({
    id: f.id,
    name: f.name,
    parent_id: f.parentId,
    owner_id: f.ownerId,
    created_at: f.createdAt,
  }));

  return NextResponse.json(mapped, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: 'Неавторизовано' }, { status: 401 });
  }

  const { name, parentId } = await request.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Невірні дані' }, { status: 400 });
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      parentId: parentId ?? null,
      ownerId: user.id,
    },
  });

  return NextResponse.json(
    {
      id: folder.id,
      name: folder.name,
      parent_id: folder.parentId,
      owner_id: folder.ownerId,
      created_at: folder.createdAt,
    },
    { status: 201 },
  );
}

