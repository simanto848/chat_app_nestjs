import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { REDIS } from '../redis/redis.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { eq, lt, and, desc } from 'drizzle-orm';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async findAll(roomId: string, limit: number = 50, before?: string) {
    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, roomId),
    });

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_FOUND',
        message: `Room with id ${roomId} does not exist`,
      });
    }

    let query: any;
    if (before) {
        const beforeMsg = await this.db.query.messages.findFirst({
            where: eq(schema.messages.id, before)
        });
        
        if (beforeMsg) {
            query = and(
                eq(schema.messages.roomId, roomId),
                lt(schema.messages.createdAt, beforeMsg.createdAt)
            );
        } else {
            query = eq(schema.messages.roomId, roomId);
        }
    } else {
        query = eq(schema.messages.roomId, roomId);
    }

    const messages = await this.db.query.messages.findMany({
      where: query,
      limit: limit + 1,
      orderBy: [desc(schema.messages.createdAt)],
    });

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      messages: results,
      hasMore,
      nextCursor,
    };
  }

  async create(roomId: string, content: string, username: string) {
    const room = await this.db.query.rooms.findFirst({
      where: eq(schema.rooms.id, roomId),
    });

    if (!room) {
      throw new NotFoundException({
        code: 'ROOM_NOT_FOUND',
        message: `Room with id ${roomId} does not exist`,
      });
    }

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > 1000) {
      throw new UnprocessableEntityException({
        code: trimmedContent.length > 1000 ? 'MESSAGE_TOO_LONG' : 'MESSAGE_EMPTY',
        message: trimmedContent.length > 1000 ? 'Message content must not exceed 1000 characters' : 'Message content cannot be empty',
      });
    }

    const id = `msg_${nanoid(10)}`;
    const result = await this.db
      .insert(schema.messages)
      .values({
        id,
        roomId,
        username,
        content: trimmedContent,
      })
      .returning();

    const message = result[0];

    // Publish to Redis for WebSocket broadcast
    await this.redis.publish('message:new', JSON.stringify(message));

    return message;
  }
}
