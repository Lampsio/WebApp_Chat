import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma'; // Upewnij się, że ścieżka jest poprawna
import Redis, { print } from 'ioredis';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const redis = new Redis();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Weryfikuj token i wyciągnij userId
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Pobierz listę znajomych użytkownika z bazy danych
    const userWithFriends = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends1: {
          include: {
            friend: true,
          },
        },
        friends2: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!userWithFriends) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Połącz listę znajomych i usuń duplikaty
    const friendsSet = new Set();
    const friends: any[] = [];

    userWithFriends.friends1.forEach(f => {
      if (!friendsSet.has(f.friend.id)) {
        friendsSet.add(f.friend.id);
        friends.push(f.friend);
      }
    });

    userWithFriends.friends2.forEach(f => {
      if (!friendsSet.has(f.user.id)) {
        friendsSet.add(f.user.id);
        friends.push(f.user);
      }
    });

    // Pobierz status online znajomych z Redis
    const onlineUsers = await redis.smembers('online_users');
    // Wypisz wartość onlineUsers w konsoli
    //console.log('Online users from Redis:', onlineUsers);

    // Dodaj status online/offline do znajomych
    // Dopasuj identyfikatory znajomych do formatu w Redis
    friends.forEach(friend => {
      friend.online = onlineUsers.includes(`user_${friend.id}`);
      //console.log(`Friend ID: ${friend.id}, isOnline: ${friend.online}`); // Logujemy ID i status online
    });


    //console.log('Friends with online status:', friends); // Logujemy znajomych z przypisanym statusem online
    
    return NextResponse.json(friends, { status: 200 });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
