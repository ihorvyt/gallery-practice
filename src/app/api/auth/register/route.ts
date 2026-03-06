import { NextResponse } from 'next/server';
import { hashPassword, signUserToken, setAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Невірні дані' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Користувач з таким email вже існує' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const token = signUserToken({ id: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json(
      { id: user.id, email: user.email, created_at: user.createdAt },
      { status: 201 },
    );
  } catch (err) {
    console.error('Register error', err);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}

