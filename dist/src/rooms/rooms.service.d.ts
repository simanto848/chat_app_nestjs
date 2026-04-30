import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import Redis from 'ioredis';
export declare class RoomsService {
    private db;
    private redis;
    constructor(db: NodePgDatabase<typeof schema>, redis: Redis);
    findAll(): Promise<{
        rooms: {
            activeUsers: number;
            id: string;
            createdAt: Date;
            name: string;
            createdBy: string;
        }[];
    }>;
    create(name: string, username: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        createdBy: string;
    }>;
    findOne(id: string): Promise<{
        activeUsers: number;
        id: string;
        createdAt: Date;
        name: string;
        createdBy: string;
    }>;
    remove(id: string, username: string): Promise<{
        deleted: boolean;
    }>;
}
