import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import Redis from 'ioredis';
export declare class MessagesService {
    private db;
    private redis;
    constructor(db: NodePgDatabase<typeof schema>, redis: Redis);
    findAll(roomId: string, limit?: number, before?: string): Promise<{
        messages: {
            id: string;
            username: string;
            createdAt: Date;
            roomId: string;
            content: string;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    create(roomId: string, content: string, username: string): Promise<{
        id: string;
        username: string;
        createdAt: Date;
        roomId: string;
        content: string;
    }>;
}
