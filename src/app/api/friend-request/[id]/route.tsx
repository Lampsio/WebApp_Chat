import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../utils/prisma'; // Upewnij się, że ścieżka jest poprawna
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function PATCH(req: NextRequest) {
  const id = req.url.split('/').pop() || '';
  const { action } = await req.json();

  if (!id || !action || !['accept', 'reject'].includes(action)) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Odczytaj token z nagłówka
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Weryfikacja tokena
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Znajdź zaproszenie
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!friendRequest) {
      return NextResponse.json({ message: 'Friend request not found' }, { status: 404 });
    }

    // Aktualizuj status zaproszenia
    await prisma.friendRequest.update({
      where: { id: Number(id) },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
    });

    if (action === 'accept') {
      // Dodaj znajomych
      await prisma.friend.createMany({
        data: [
          { userId: friendRequest.senderId, friendId: friendRequest.receiverId },
          { userId: friendRequest.receiverId, friendId: friendRequest.senderId },
        ],
      });
    }

    return NextResponse.json({ message: 'Friend request updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
