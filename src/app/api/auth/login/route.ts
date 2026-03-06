import { NextResponse } from 'next/server';
import { verifyPassword, signUserToken, setAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Невірні дані' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
    }

    const token = signUserToken({ id: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      created_at: user.createdAt,
    });
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}

