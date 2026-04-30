import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { REDIS } from '../redis/redis.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async login(username: string) {
    let user = await this.db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });

    if (!user) {
      const id = `usr_${nanoid(10)}`;
      const result = await this.db
        .insert(schema.users)
        .values({
          id,
          username,
        })
        .returning();
      user = result[0];
    }

    const sessionToken = nanoid(32);
    // Store session in Redis for 24 hours
    await this.redis.set(`session:${sessionToken}`, user.id, 'EX', 86400);

    return {
      sessionToken,
      user,
    };
  }

  async validateSession(token: string) {
    const userId = await this.redis.get(`session:${token}`);
    if (!userId) return null;

    return this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
  }
}
