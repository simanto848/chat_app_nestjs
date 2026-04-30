import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { REDIS } from '../redis/redis.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async findAll() {
    const rooms = await this.db.query.rooms.findMany();
    
    const roomsWithActiveUsers = await Promise.all(
      rooms.map(async (room) => {
        const activeUsers = await this.redis.scard(`room:active_users:${room.id}`);
        return {
          ...room,
          activeUsers,
        };
      }),
    );

    return { rooms: roomsWithActiveUsers };
  }

  async create(name: string, username: string) {
    const existing = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.name, name),
    });

    if (existing) {
      throw new ConflictException({
        code: 'ROOM_NAME_TAKEN',
        message: 'A room with this name already exists',
      });
    }

    const id = `room_${nanoid(10)}`;
    const result = await this.db
      .insert(schema.rooms)
      .values({
        id,
        name,
        createdBy: username,
      })
      .returning();

    return result[0];
  }

  async findOne(id: string) {
    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, id),
    });

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_FOUND',
        message: `Room with id ${id} does not exist`,
      });
    }

    const activeUsers = await this.redis.scard(`room:active_users:${room.id}`);
    return {
      ...room,
      activeUsers,
    };
  }

  async remove(id: string, username: string) {
    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, id),
    });

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_FOUND',
        message: `Room with id ${id} does not exist`,
      });
    }

    if (room.createdBy !== username) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the room creator can delete this room',
      });
    }

    await this.db.delete(schema.rooms).where(eq(schema.rooms.id, id));
    
    // Publish to Redis for WebSocket broadcast
    await this.redis.publish('room:deleted', JSON.stringify({ roomId: id }));

    // Cleanup Redis (optional, but good practice)
    await this.redis.del(`room:active_users:${id}`);

    return { deleted: true };
  }
}
