import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import Redis from 'ioredis';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const redis = new Redis(); // Domyślne połączenie do Redis na localhost:6379

// Funkcja testująca połączenie z Redis
const checkRedisConnection = async () => {
  try {
    const response = await redis.ping();
    console.log('Redis connection test: ', response); // Powinno wypisać 'PONG'
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

// Funkcja testująca operacje Redis
const testRedisOperations = async () => {
  try {
    await redis.set('test_key', 'test_value');
    const value = await redis.get('test_key');
    console.log('Redis test key value:', value); // Powinno wypisać 'test_value'
  } catch (error) {
    console.error('Redis operations error:', error);
  }
};

const server = createServer((req, res) => {
  handle(req, res);
});

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Obsługa dołączania użytkowników do pokoju czatu
  socket.on('join_chat', (room) => {
    console.log(`User ${socket.id} joined room ${room}`);
    socket.join(room);
  });

  // Obsługa opuszczania pokoju czatu
  socket.on('leave_chat', (room) => {
    console.log(`User ${socket.id} left room ${room}`);
    socket.leave(room);
  });

  // Obsługa dołączania użytkowników do pokoju z obsługą Redis
  socket.on('join', async (room) => {
    console.log(`User ${socket.id} joined ${room}`);
    socket.join(room);
    await redis.sadd('online_users', room);
    io.emit('user_status', { user: room, status: 'ONLINE' });
  });

  // Obsługa opuszczania pokoju z obsługą Redis
  socket.on('leave', async (room) => {
    console.log(`User ${socket.id} left ${room}`);
    socket.leave(room);
    await redis.srem('online_users', room);
    io.emit('user_status', { user: room, status: 'OFFLINE' });
  });

  // Obsługa wysyłania wiadomości (dla obu przypadków)
  socket.on('send_message', (message) => {
    console.log('Message received:', message);
    const room = `chat_${Math.min(message.senderId, message.receiverId)}_${Math.max(message.senderId, message.receiverId)}`;
    io.to(room).emit('new_message', message); // Emit new message to all in room
  });

  // Obsługa rozłączania użytkownika
  socket.on('disconnect', async () => {
    console.log('User disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  server.listen(PORT, async () => {
    console.log(`> Ready on http://localhost:${PORT}`);
    await checkRedisConnection(); // Testujemy połączenie
    await testRedisOperations(); // Testujemy operacje Redis
  });
});

export { io };
