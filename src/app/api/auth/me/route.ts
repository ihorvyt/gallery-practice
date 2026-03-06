import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const payload = await getUserFromRequest();
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      user
        ? { user: { id: user.id, email: user.email, created_at: user.createdAt } }
        : { user: null },
      { status: 200 },
    );
  } catch (err) {
    console.error('Me error', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

