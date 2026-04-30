import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseFilters } from '@nestjs/common';
import { REDIS } from '../redis/redis.module';
import Redis from 'ioredis';
import { AuthService } from '../auth/auth.service';
import { RoomsService } from '../rooms/rooms.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private redisSub: Redis;

  constructor(
    @Inject(REDIS) private redis: Redis,
    private authService: AuthService,
    private roomsService: RoomsService,
  ) {
    // Setup Redis Subscriber
    this.redisSub = this.redis.duplicate();
    this.redisSub.subscribe('message:new', 'room:deleted');
    this.redisSub.on('message', (channel, message) => {
      const data = JSON.parse(message);
      if (channel === 'message:new') {
        this.server.to(data.roomId).emit('message:new', {
          id: data.id,
          username: data.username,
          content: data.content,
          createdAt: data.createdAt,
        });
      } else if (channel === 'room:deleted') {
        this.server.to(data.roomId).emit('room:deleted', { roomId: data.roomId });
        // Optional: force disconnect clients in that room
      }
    });
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    const roomId = client.handshake.query.roomId as string;

    if (!token || !roomId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Missing token or roomId' });
      client.disconnect();
      return;
    }

    const user = await this.authService.validateSession(token);
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' });
      client.disconnect();
      return;
    }

    try {
      await this.roomsService.findOne(roomId);
    } catch (e) {
      client.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      client.disconnect();
      return;
    }

    // Join room
    client.join(roomId);
    client.data.user = user;
    client.data.roomId = roomId;

    // Add to active users in Redis
    await this.redis.sadd(`room:active_users:${roomId}`, user.username);
    const activeUsers = await this.redis.smembers(`room:active_users:${roomId}`);

    // Emit room:joined to connecting client
    client.emit('room:joined', { activeUsers });

    // Broadcast room:user_joined to others
    client.to(roomId).emit('room:user_joined', {
      username: user.username,
      activeUsers,
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    const roomId = client.data.roomId;

    if (user && roomId) {
      await this.leaveRoom(user.username, roomId);
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeave(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    const roomId = client.data.roomId;

    if (user && roomId) {
      await this.leaveRoom(user.username, roomId);
      client.leave(roomId);
    }
  }

  private async leaveRoom(username: string, roomId: string) {
    await this.redis.srem(`room:active_users:${roomId}`, username);
    const activeUsers = await this.redis.smembers(`room:active_users:${roomId}`);

    this.server.to(roomId).emit('room:user_left', {
      username,
      activeUsers,
    });
  }
}
