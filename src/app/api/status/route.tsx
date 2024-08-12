import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(req: NextRequest) {
  const { status } = await req.json();

  if (!['AVAILABLE', 'BUSY', 'AWAY'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return NextResponse.json({ message: 'Status updated', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
