"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const db_module_1 = require("../db/db.module");
const redis_module_1 = require("../redis/redis.module");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = __importStar(require("../db/schema"));
const ioredis_1 = __importDefault(require("ioredis"));
const nanoid_1 = require("nanoid");
const drizzle_orm_1 = require("drizzle-orm");
let MessagesService = class MessagesService {
    db;
    redis;
    constructor(db, redis) {
        this.db = db;
        this.redis = redis;
    }
    async findAll(roomId, limit = 50, before) {
        const room = await this.db.query.rooms.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.rooms.id, roomId),
        });
        if (!room) {
            throw new common_1.NotFoundException({
                code: 'ROOM_NOT_FOUND',
                message: `Room with id ${roomId} does not exist`,
            });
        }
        let query;
        if (before) {
            const beforeMsg = await this.db.query.messages.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.messages.id, before)
            });
            if (beforeMsg) {
                query = (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.messages.roomId, roomId), (0, drizzle_orm_1.lt)(schema.messages.createdAt, beforeMsg.createdAt));
            }
            else {
                query = (0, drizzle_orm_1.eq)(schema.messages.roomId, roomId);
            }
        }
        else {
            query = (0, drizzle_orm_1.eq)(schema.messages.roomId, roomId);
        }
        const messages = await this.db.query.messages.findMany({
            where: query,
            limit: limit + 1,
            orderBy: [(0, drizzle_orm_1.desc)(schema.messages.createdAt)],
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
    async create(roomId, content, username) {
        const room = await this.db.query.rooms.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.rooms.id, roomId),
        });
        if (!room) {
            throw new common_1.NotFoundException({
                code: 'ROOM_NOT_FOUND',
                message: `Room with id ${roomId} does not exist`,
            });
        }
        const trimmedContent = content.trim();
        if (!trimmedContent || trimmedContent.length > 1000) {
            throw new common_1.UnprocessableEntityException({
                code: trimmedContent.length > 1000 ? 'MESSAGE_TOO_LONG' : 'MESSAGE_EMPTY',
                message: trimmedContent.length > 1000 ? 'Message content must not exceed 1000 characters' : 'Message content cannot be empty',
            });
        }
        const id = `msg_${(0, nanoid_1.nanoid)(10)}`;
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
        await this.redis.publish('message:new', JSON.stringify(message));
        return message;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(db_module_1.DRIZZLE)),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase,
        ioredis_1.default])
], MessagesService);
//# sourceMappingURL=messages.service.js.map