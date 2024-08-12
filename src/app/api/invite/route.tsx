// src/app/api/friend-request/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma'; // Upewnij się, że ścieżka jest poprawna

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(req: NextRequest) {
  const { receiverId } = await req.json();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Weryfikuj token i wyciągnij userId
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const senderId = decoded.userId;

    // Sprawdź, czy zaproszenie już istnieje
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json({ message: 'Friend request already sent' }, { status: 400 });
    }

    // Utwórz nowe zaproszenie
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(friendRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating friend request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
