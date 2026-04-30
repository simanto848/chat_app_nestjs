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
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const db_module_1 = require("../db/db.module");
const redis_module_1 = require("../redis/redis.module");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = __importStar(require("../db/schema"));
const ioredis_1 = __importDefault(require("ioredis"));
const nanoid_1 = require("nanoid");
const drizzle_orm_1 = require("drizzle-orm");
let RoomsService = class RoomsService {
    db;
    redis;
    constructor(db, redis) {
        this.db = db;
        this.redis = redis;
    }
    async findAll() {
        const rooms = await this.db.query.rooms.findMany();
        const roomsWithActiveUsers = await Promise.all(rooms.map(async (room) => {
            const activeUsers = await this.redis.scard(`room:active_users:${room.id}`);
            return {
                ...room,
                activeUsers,
            };
        }));
        return { rooms: roomsWithActiveUsers };
    }
    async create(name, username) {
        const existing = await this.db.query.rooms.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.rooms.name, name),
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'ROOM_NAME_TAKEN',
                message: 'A room with this name already exists',
            });
        }
        const id = `room_${(0, nanoid_1.nanoid)(10)}`;
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
    async findOne(id) {
        const room = await this.db.query.rooms.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.rooms.id, id),
        });
        if (!room) {
            throw new common_1.NotFoundException({
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
    async remove(id, username) {
        const room = await this.db.query.rooms.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.rooms.id, id),
        });
        if (!room) {
            throw new common_1.NotFoundException({
                code: 'ROOM_NOT_FOUND',
                message: `Room with id ${id} does not exist`,
            });
        }
        if (room.createdBy !== username) {
            throw new common_1.ForbiddenException({
                code: 'FORBIDDEN',
                message: 'Only the room creator can delete this room',
            });
        }
        await this.db.delete(schema.rooms).where((0, drizzle_orm_1.eq)(schema.rooms.id, id));
        await this.redis.publish('room:deleted', JSON.stringify({ roomId: id }));
        await this.redis.del(`room:active_users:${id}`);
        return { deleted: true };
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(db_module_1.DRIZZLE)),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase,
        ioredis_1.default])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map