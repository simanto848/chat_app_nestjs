import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import Redis from 'ioredis';
export declare class AuthService {
    private db;
    private redis;
    constructor(db: NodePgDatabase<typeof schema>, redis: Redis);
    login(username: string): Promise<{
        sessionToken: string;
        user: {
            id: string;
            username: string;
            createdAt: Date;
        };
    }>;
    validateSession(token: string): Promise<{
        id: string;
        username: string;
        createdAt: Date;
    } | null | undefined>;
}
