import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../utils/prisma'; // Upewnij się, że ścieżka jest poprawna
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function GET(req: NextRequest) {
  try {
    // Odczytaj token z nagłówka
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Weryfikacja tokena
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Pobierz zaproszenia przyjaźni
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: true, // Dołącz dane nadawcy
      },
    });

    return NextResponse.json(friendRequests, { status: 200 });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
