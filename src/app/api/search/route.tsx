import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma'; // Upewnij się, że ścieżka jest poprawna

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function GET(req: NextRequest) {
  const url = new URL(req.url); // Parsowanie URL z obiektu NextRequest
  const search = url.searchParams.get('search'); // Odczytanie parametru zapytania

  if (typeof search !== 'string') {
    return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Weryfikuj token i wyciągnij userId
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Pobierz użytkowników z wykluczeniem aktualnie zalogowanego
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId }, // Wyklucza użytkownika o id równym userId
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { surname: { contains: search, mode: 'insensitive' } },
          { 
            AND: [
              { name: { contains: search.split(' ')[0], mode: 'insensitive' } },
              { surname: { contains: search.split(' ')[1] || '', mode: 'insensitive' } },
            ]
          }
        ],
      },
      select: {
        id: true,
        picture_profile: true,
        name: true,
        surname: true,
        short_description: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
