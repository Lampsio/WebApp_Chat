import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const friendId = searchParams.get('friendId');

  if (!userId || !friendId) {
    return NextResponse.json({ error: 'Missing userId or friendId' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId, 10), receiverId: parseInt(friendId, 10) },
          { senderId: parseInt(friendId, 10), receiverId: parseInt(userId, 10) },
        ],
      },
      orderBy: { timestamp: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
            picture_profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            surname: true,
            picture_profile: true,
          },
        },
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}
